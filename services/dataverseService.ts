

import { ACCESS_TOKEN_URL, DATAVERSE_BASE_URL, PROJECTS_ENTITY_SET, TASKS_ENTITY_SET } from '../constants';
import type { Project, DataverseCollectionResponse, ProjectCategory, Task, TaskStatus, NewTaskPayload, UpdateTaskPayload, TaskPriority, ProductMember, UpdateProjectPayload, NewProjectPayload, WeCareSystem, ProjectStatus, TechResource } from '../types';

/**
 * Converts a 'YYYY-MM-DD' date string to a full ISO 8601 UTC string.
 * The time is set to 08:00 for 'start' and 17:00 for 'end', assuming a UTC+7 timezone.
 * @param dateString The date string in 'YYYY-MM-DD' format.
 * @param timeType Determines whether to use start time (08:00) or end time (17:00).
 * @returns The full ISO string in UTC (e.g., "2025-10-29T01:00:00.000Z"), or undefined if input is invalid.
 */
const convertDateToUtcPlus7 = (dateString: string | undefined, timeType: 'start' | 'end'): string | undefined => {
    if (!dateString) {
        return undefined;
    }
    try {
        const time = timeType === 'start' ? '08:00:00' : '17:00:00';
        const isoStringWithOffset = `${dateString}T${time}+07:00`;
        const date = new Date(isoStringWithOffset);
        // Check for invalid date strings that might not throw but result in 'Invalid Date'
        if (isNaN(date.getTime())) {
            return undefined;
        }
        return date.toISOString();
    } catch {
        return undefined;
    }
};


/**
 * Formats an ISO date string into a localized date string, ensuring the date doesn't shift due to timezones.
 * This is crucial for handling Dataverse "Date Only" fields that are stored as midnight UTC.
 * @param {string} isoString - The ISO date string from Dataverse.
 * @returns {string} The formatted date string (e.g., "MM/DD/YYYY") or an empty string.
 */
const formatDateOnly = (isoString?: string): string => {
    if (!isoString) {
        return '';
    }
    try {
        const date = new Date(isoString);
        // Using toLocaleDateString with UTC timezone prevents the date from shifting
        // to the previous day in timezones west of UTC.
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
        });
    } catch {
        return ''; // Return empty string for invalid dates
    }
};

/**
 * Fetches the access token from the Power Automate flow.
 * @returns {Promise<string>} The access token.
 */
export async function getAccessToken(): Promise<string> {
  const response = await fetch(ACCESS_TOKEN_URL, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch access token');
  }
  const data = await response.json();
  // Assuming the token is directly in the response body or in a property
  return data.access_token || data; 
}

/**
 * A helper function to perform authenticated fetch requests to the Dataverse API.
 * @param {string} endpoint - The Dataverse API endpoint to call.
 * @param {string} token - The bearer token for authentication.
 * @param {RequestInit} options - Optional fetch options.
 * @param {string | null} loggedInUserId - The GUID of the user to impersonate.
 * @returns {Promise<T>} The JSON response from the API.
 */
async function dataverseFetch<T>(endpoint: string, token: string, options: RequestInit = {}, loggedInUserId: string | null = null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  const method = options.method?.toUpperCase();
  if (loggedInUserId && (method === 'POST' || method === 'PATCH' || method === 'DELETE')) {
      headers.set('MSCRMCallerID', loggedInUserId);
  }
  
  // Always include annotations. For POST, also ask for the created object back.
  const preferHeaders = ['odata.include-annotations="OData.Community.Display.V1.FormattedValue"'];
  if (method === 'POST') {
    preferHeaders.push('return=representation');
  }
  headers.set('Prefer', preferHeaders.join(','));
  
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(`${DATAVERSE_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return Promise.resolve(undefined as T);
  }
    
  if (!response.ok) {
    const responseData = await response.json();
    throw new Error(`Dataverse API Error: ${responseData.error?.message || response.statusText}`);
  }

  // Handle cases where response might be empty for non-204 statuses
  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

/**
 * Fetches all product members for assignment dropdowns.
 * @param {string} token - The access token.
 * @returns {Promise<ProductMember[]>} A list of product members.
 */
export async function getProductMembers(token: string): Promise<ProductMember[]> {
    const endpoint = `crdfd_productmembers?$select=crdfd_productmemberid,crdfd_name&$orderby=crdfd_name asc`;
    try {
        const response = await dataverseFetch<DataverseCollectionResponse<{ crdfd_productmemberid: string; crdfd_name: string; }>>(endpoint, token);
        return response.value.map(member => ({
            id: member.crdfd_productmemberid,
            name: member.crdfd_name
        }));
    } catch (error) {
        console.error("Failed to fetch product members:", error);
        return [];
    }
}

/**
 * Fetches all "We Care" systems for dropdowns.
 * @param {string} token - The access token.
 * @returns {Promise<WeCareSystem[]>} A list of systems.
 */
export async function getWeCareSystems(token: string): Promise<WeCareSystem[]> {
    const endpoint = `crdfd_wecaresystems?$select=crdfd_wecaresystemid,crdfd_name&$orderby=crdfd_name asc`;
    try {
        const response = await dataverseFetch<DataverseCollectionResponse<{ crdfd_wecaresystemid: string; crdfd_name: string; }>>(endpoint, token);
        return response.value.map(system => ({
            id: system.crdfd_wecaresystemid,
            name: system.crdfd_name
        }));
    } catch (error) {
        console.error("Failed to fetch we care systems:", error);
        return [];
    }
}


/**
 * Fetches a list of projects from Dataverse and categorizes them.
 * @param {string} token - The access token.
 * @param {number} [departmentValue] - Optional choice value of the department to filter projects by.
 * @returns {Promise<Project[]>} A list of projects with categories.
 */
export async function getProjects(token: string, departmentValue?: number): Promise<Project[]> {
    const selectFields = [
        'ai_processid', 'ai_name', 'createdon',
        '_ownerid_value', // User (Owner - Lookup)
        'crdfd_user', // IT Staff (Text)
        'crdfd_department_', // Department (Choice)
        '_crdfd_system_value', // System (Lookup)
        'crdfd_requester', // Requester (Text)
        'crdfd_processurl',
        'crdfd_allstepurl',
        'crdfd_description',
        'crdfd_objectives',
        'cr1bb_fullcontext',
        'crdfd_groupchat',
        'crdfd_user_guide',
        'crdfd_technical_docs',
        'crdfd_priority', // Priority (Choice)
        'crdfd_processstatus',
        'crdfd_start_date',
        'crdfd_end_date',
    ].join(',');

    let filter: string;
    const GENERAL_DEPARTMENT_VALUE = 191920006;
    
    if (departmentValue !== undefined) {
        // For logged-in users, filter by department and show Active, Maintenance, Backlog and Completed projects.
        // Excludes Planned (191920000) only.
        filter = `statecode eq 0 and crdfd_processstatus ne 191920000 and crdfd_department_ eq ${departmentValue}`;
    } else {
        // For guests (not logged in), only show Active (191920001) and Maintenance (191920003) projects from the General department.
        filter = `statecode eq 0 and (crdfd_processstatus eq 191920001 or crdfd_processstatus eq 191920003) and crdfd_department_ eq ${GENERAL_DEPARTMENT_VALUE}`;
    }

    const endpoint = `${PROJECTS_ENTITY_SET}?$select=${selectFields}&$filter=${filter}&$orderby=createdon desc`;
    const response = await dataverseFetch<DataverseCollectionResponse<any>>(endpoint, token);
    
    return response.value.map((p): Project => {
        const projectStatus = mapDataverseProjectStatusToAppStatus(p['crdfd_processstatus@OData.Community.Display.V1.FormattedValue']);
        
        let category: ProjectCategory;
        switch (projectStatus) {
            case 'Maintenance':
                category = 'MAINTENANCE';
                break;
            case 'Planning':
            case 'Backlog':
                category = 'PLANNED';
                break;
            case 'Completed / Closed':
                category = 'COMPLETED';
                break;
            case 'Active':
            default:
                category = 'ACTIVE';
                break;
        }

        return {
            ...p,
            category,
            department: p['crdfd_department_@OData.Community.Display.V1.FormattedValue'] || 'General',
            system: p['_crdfd_system_value@OData.Community.Display.V1.FormattedValue'] || 'General',
            user: p['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A',
            requester: p.crdfd_requester || 'N/A',
            crdfd_priority: p['crdfd_priority@OData.Community.Display.V1.FormattedValue'] || 'N/A',
            crdfd_processstatus: projectStatus,
            itStaff: p.crdfd_user ? [p.crdfd_user] : ['N/A'],
        };
    });
}

const mapDataverseStatusToAppStatus = (dataverseStatus: string): TaskStatus => {
  switch (dataverseStatus) {
    case 'Not Start':
      return 'To Do';
    case 'In Progress':
      return 'In Progress';
    case 'Review':
      return 'Review';
    case 'Completed':
      return 'Completed';
    case 'Pending':
      return 'Pending';
    case 'Cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const mapAppStatusToDataverseValue = (appStatus: TaskStatus): number | undefined => {
    switch(appStatus) {
        case 'To Do': return 191920000; // Not Start
        case 'In Progress': return 191920001;
        case 'Review': return 191920002;
        case 'Completed': return 191920003;
        case 'Pending': return 191920004;
        default: return undefined;
    }
}

const mapAppPriorityToDataverseValue = (appPriority: TaskPriority): number | undefined => {
    switch(appPriority) {
        case 'High': return 191920000;
        case 'Medium': return 191920001;
        case 'Low': return 191920002;
        default: return undefined;
    }
}

const mapDataversePriorityToAppPriority = (dataversePriority: string): TaskPriority => {
    switch(dataversePriority) {
        case 'High':
        case 'Medium':
        case 'Low':
            return dataversePriority;
        default:
            return 'N/A';
    }
}

const mapAppProjectStatusToDataverseValue = (appStatus: ProjectStatus): number | undefined => {
    switch(appStatus) {
        case 'Planning': return 191920000;
        case 'Active': return 191920001;
        case 'Backlog': return 191920002;
        case 'Maintenance': return 191920003;
        case 'Completed / Closed': return 100000001;
        default: return undefined;
    }
}

const mapDataverseProjectStatusToAppStatus = (dataverseStatus: string): ProjectStatus => {
    switch(dataverseStatus) {
        case 'Planning':
        case 'Active':
        case 'Backlog':
        case 'Maintenance':
        case 'Completed / Closed':
            return dataverseStatus;
        default:
            return 'Backlog'; // A safe default
    }
}

const commonTaskSelectFields = [
    'crdfd_tech_tasksid',
    'crdfd_name',
    'crdfd_description',
    'crdfd_taskstatus',
    'statecode',
    '_crdfd_assignedtask_value',
    '_crdfd_tech_resource_value',
    'crdfd_start_date',
    'crdfd_enddate',
    'crdfd_priority',
    'createdon',
    'crdfd_proof_of_complete_',
    '_crdfd_process_value',
].join(',');

const commonTechResourceSelect = 'crdfd_tech_resourceid,crdfd_name,crdfd_type,crdfd_version,crdfd_description,crdfd_resourcelink,crdfd_resourcejson';

const transformDataverseTask = (t: any): Task => {
    const rawStatus = t['crdfd_taskstatus@OData.Community.Display.V1.FormattedValue'];
    const stateCode = t.statecode; // 0 for Active, 1 for Inactive
    const rawPriority = t['crdfd_priority@OData.Community.Display.V1.FormattedValue'];
    
    let status: TaskStatus;
    if (stateCode === 1) { // Inactive
        // For this app, any inactive task that isn't explicitly 'Completed' is considered 'Cancelled'.
        if (rawStatus === 'Completed') {
            status = 'Completed';
        } else {
            status = 'Cancelled';
        }
    } else { // Active
        status = mapDataverseStatusToAppStatus(rawStatus);
    }

    const techResourceData = t.crdfd_Tech_Resource;
    let techResource: TechResource | undefined = undefined;
    if (techResourceData) {
        techResource = {
            id: techResourceData.crdfd_tech_resourceid,
            name: techResourceData.crdfd_name,
            type: techResourceData['crdfd_type@OData.Community.Display.V1.FormattedValue'] || techResourceData.crdfd_type,
            version: techResourceData.crdfd_version,
            description: techResourceData.crdfd_description,
            resourceLink: techResourceData.crdfd_resourcelink,
            resourceJson: techResourceData.crdfd_resourcejson,
        };
    }

    return {
      id: t.crdfd_tech_tasksid,
      name: t.crdfd_name || 'Unnamed Task',
      status: status,
      assignee: t.crdfd_Assignedtask?.crdfd_name || 'Unassigned',
      assigneeId: t._crdfd_assignedtask_value,
      dueDate: formatDateOnly(t.crdfd_enddate) || 'No due date',
      endDateRaw: t.crdfd_enddate,
      project: t['_crdfd_process_value@OData.Community.Display.V1.FormattedValue'] || 'N/A',
      projectId: t._crdfd_process_value,
      description: t.crdfd_description || '',
      startDate: formatDateOnly(t.crdfd_start_date) || 'N/A',
      startDateRaw: t.crdfd_start_date,
      priority: mapDataversePriorityToAppPriority(rawPriority),
      createdOn: t['createdon@OData.Community.Display.V1.FormattedValue'] || 'N/A',
      createdOnDate: t.createdon,
      proofOfComplete: t.crdfd_proof_of_complete_ || undefined,
      techResource,
    };
};

export async function getAllTasks(token: string): Promise<Task[]> {
    const endpoint = `${TASKS_ENTITY_SET}?$select=${commonTaskSelectFields}&$expand=crdfd_Assignedtask($select=crdfd_name),crdfd_Tech_Resource($select=${commonTechResourceSelect})&$orderby=createdon asc`;
    const response = await dataverseFetch<DataverseCollectionResponse<any>>(endpoint, token);
    return response.value.map(transformDataverseTask);
}


export async function getTasksForProject(projectId: string, token: string): Promise<Task[]> {
  const endpoint = `${TASKS_ENTITY_SET}?$select=${commonTaskSelectFields}&$expand=crdfd_Assignedtask($select=crdfd_name),crdfd_Tech_Resource($select=${commonTechResourceSelect})&$filter=_crdfd_process_value eq ${projectId}&$orderby=createdon asc`;
  const response = await dataverseFetch<DataverseCollectionResponse<any>>(endpoint, token);
  return response.value.map(transformDataverseTask);
}

/**
 * Fetches tasks for a specific list of project IDs.
 * @param {string[]} projectIds - An array of project GUIDs.
 * @param {string} token - The access token.
 * @returns {Promise<Task[]>} A list of tasks belonging to the specified projects.
 */
export async function getTasksForProjects(projectIds: string[], token: string): Promise<Task[]> {
    if (projectIds.length === 0) {
        return [];
    }

    const filter = projectIds.map(id => `_crdfd_process_value eq ${id}`).join(' or ');
    
    const endpoint = `${TASKS_ENTITY_SET}?$select=${commonTaskSelectFields}&$expand=crdfd_Assignedtask($select=crdfd_name),crdfd_Tech_Resource($select=${commonTechResourceSelect})&$filter=(${filter})&$orderby=createdon asc`;
    const response = await dataverseFetch<DataverseCollectionResponse<any>>(endpoint, token);
    return response.value.map(transformDataverseTask);
}

export async function createTask(taskData: NewTaskPayload, token: string, loggedInUserId: string | null): Promise<void> {
  const endpoint = TASKS_ENTITY_SET;
  
  const payload: any = {
    "crdfd_name": taskData.name,
    "crdfd_description": taskData.description,
    "crdfd_Process@odata.bind": `/${PROJECTS_ENTITY_SET}(${taskData.projectId})`,
  };

  if (taskData.assigneeId) {
      payload["crdfd_Assignedtask@odata.bind"] = `/crdfd_productmembers(${taskData.assigneeId})`;
  }

  // Convert dates to UTC+7 at specific times
  payload.crdfd_start_date = convertDateToUtcPlus7(taskData.startDate, 'start');
  payload.crdfd_enddate = convertDateToUtcPlus7(taskData.endDate, 'end');

  const statusValue = taskData.status ? mapAppStatusToDataverseValue(taskData.status) : undefined;
  if (statusValue) payload["crdfd_taskstatus"] = statusValue;

  const priorityValue = taskData.priority ? mapAppPriorityToDataverseValue(taskData.priority) : undefined;
  if (priorityValue) payload["crdfd_priority"] = priorityValue;
  

  await dataverseFetch<void>(endpoint, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, loggedInUserId);
}

export async function updateTask(taskId: string, taskData: UpdateTaskPayload, token: string, loggedInUserId: string | null): Promise<void> {
  const endpoint = `${TASKS_ENTITY_SET}(${taskId})`;

  // Special handling for deactivation (Cancelling a task).
  if (taskData.status === 'Cancelled') {
      const deactivatePayload = {
          statecode: 1, // Inactive
          // We must provide a valid status reason for the inactive state.
          // Since one for "Cancelled" may not exist, we'll re-use an existing one as a workaround.
          // The UI will interpret any inactive task as "Cancelled".
          crdfd_taskstatus: 191920002, // Corresponds to 'Review'
      };
      await dataverseFetch<void>(endpoint, token, {
          method: 'PATCH',
          body: JSON.stringify(deactivatePayload),
      }, loggedInUserId);
      return; // Exit after deactivating.
  }
  
  const payload: any = {};
  if (taskData.name !== undefined) payload.crdfd_name = taskData.name;
  if (taskData.description !== undefined) payload.crdfd_description = taskData.description;
  if (taskData.proofOfComplete !== undefined) payload.crdfd_proof_of_complete_ = taskData.proofOfComplete;
  
  // Convert dates to UTC+7 at specific times, or set to null if cleared
  if (taskData.startDate !== undefined) {
    payload.crdfd_start_date = taskData.startDate ? convertDateToUtcPlus7(taskData.startDate, 'start') : null;
  }
  if (taskData.endDate !== undefined) {
    payload.crdfd_enddate = taskData.endDate ? convertDateToUtcPlus7(taskData.endDate, 'end') : null;
  }

  if (taskData.assigneeId !== undefined) {
    if (taskData.assigneeId) {
        payload["crdfd_Assignedtask@odata.bind"] = `/crdfd_productmembers(${taskData.assigneeId})`;
    } else {
        // Disassociate if assigneeId is null or empty
        try {
            await dataverseFetch<void>(`${endpoint}/crdfd_Assignedtask/$ref`, token, { method: 'DELETE' }, loggedInUserId);
        } catch (e: any) {
            // A 404 is expected if it's already null, so we can ignore it.
            if (!e.message || !e.message.includes('404')) {
                throw e; // re-throw other errors
            }
        }
    }
  }
  
  if (taskData.status) {
    const statusValue = mapAppStatusToDataverseValue(taskData.status);
    if (statusValue) payload.crdfd_taskstatus = statusValue;
  }

  if (taskData.priority) {
    const priorityValue = mapAppPriorityToDataverseValue(taskData.priority);
    if (priorityValue) payload.crdfd_priority = priorityValue;
  }


  if (Object.keys(payload).length > 0) {
    await dataverseFetch<void>(endpoint, token, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, loggedInUserId);
  }
}

export async function createProject(projectData: NewProjectPayload, token: string, loggedInUserId: string | null): Promise<Project> {
  const endpoint = PROJECTS_ENTITY_SET;
  
  const payload: any = {
    "ai_name": projectData.ai_name,
  };

  if (projectData.crdfd_systemid) {
    payload["crdfd_System@odata.bind"] = `/crdfd_wecaresystems(${projectData.crdfd_systemid})`;
  }
  
  if (projectData.crdfd_department_ !== undefined) {
      payload.crdfd_department_ = projectData.crdfd_department_;
  }

  if (projectData.crdfd_description) payload.crdfd_description = projectData.crdfd_description;
  if (projectData.crdfd_requester) payload.crdfd_requester = projectData.crdfd_requester;
  if (projectData.crdfd_user) payload.crdfd_user = projectData.crdfd_user; // IT Staff
  if (projectData.crdfd_groupchat) payload.crdfd_groupchat = projectData.crdfd_groupchat;
  if (projectData.crdfd_user_guide) payload.crdfd_user_guide = projectData.crdfd_user_guide;
  if (projectData.crdfd_technical_docs) payload.crdfd_technical_docs = projectData.crdfd_technical_docs;
  if (projectData.crdfd_processurl) payload.crdfd_processurl = projectData.crdfd_processurl;
  if (projectData.crdfd_allstepurl) payload.crdfd_allstepurl = projectData.crdfd_allstepurl;
  if (projectData.crdfd_start_date) payload.crdfd_start_date = projectData.crdfd_start_date;
  if (projectData.crdfd_end_date) payload.crdfd_end_date = projectData.crdfd_end_date;


  if (projectData.crdfd_priority) {
      const priorityValue = mapAppPriorityToDataverseValue(projectData.crdfd_priority);
      if (priorityValue !== undefined) {
          payload.crdfd_priority = priorityValue;
      }
  }
  
  if (projectData.crdfd_processstatus) {
      const statusValue = mapAppProjectStatusToDataverseValue(projectData.crdfd_processstatus);
      if (statusValue !== undefined) {
          payload.crdfd_processstatus = statusValue;
      }
  }

  return await dataverseFetch<Project>(endpoint, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, loggedInUserId);
}

export async function updateProject(projectId: string, projectData: UpdateProjectPayload, token: string, loggedInUserId: string | null): Promise<void> {
    const endpoint = `${PROJECTS_ENTITY_SET}(${projectId})`;

    const payload: any = {};
    if (projectData.ai_name !== undefined) payload.ai_name = projectData.ai_name;
    if (projectData.crdfd_description !== undefined) payload.crdfd_description = projectData.crdfd_description;
    if (projectData.crdfd_requester !== undefined) payload.crdfd_requester = projectData.crdfd_requester;
    if (projectData.crdfd_user !== undefined) payload.crdfd_user = projectData.crdfd_user; // IT Staff
    if (projectData.crdfd_groupchat !== undefined) payload.crdfd_groupchat = projectData.crdfd_groupchat;
    if (projectData.crdfd_user_guide !== undefined) payload.crdfd_user_guide = projectData.crdfd_user_guide;
    if (projectData.crdfd_technical_docs !== undefined) payload.crdfd_technical_docs = projectData.crdfd_technical_docs;
    if (projectData.crdfd_processurl !== undefined) payload.crdfd_processurl = projectData.crdfd_processurl;
    if (projectData.crdfd_allstepurl !== undefined) payload.crdfd_allstepurl = projectData.crdfd_allstepurl;

    // FIX: Convert empty string to null for date fields to allow clearing them and prevent write errors.
    if (projectData.crdfd_start_date !== undefined) payload.crdfd_start_date = projectData.crdfd_start_date || null;
    if (projectData.crdfd_end_date !== undefined) payload.crdfd_end_date = projectData.crdfd_end_date || null;


    if (projectData.crdfd_priority) {
        const priorityValue = mapAppPriorityToDataverseValue(projectData.crdfd_priority);
        if (priorityValue !== undefined) {
            payload.crdfd_priority = priorityValue;
        }
    }
    
    if (projectData.crdfd_processstatus) {
        const statusValue = mapAppProjectStatusToDataverseValue(projectData.crdfd_processstatus);
        if (statusValue !== undefined) {
            payload.crdfd_processstatus = statusValue;
        }
    }

    if (Object.keys(payload).length > 0) {
        await dataverseFetch<void>(endpoint, token, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }, loggedInUserId);
    }
}
