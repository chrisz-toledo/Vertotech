
import type { Employee, Client, TimeLog, SafetyReport, Jobsite, ExtraWorkTicket, Tool, Material, Invoice, GlobalSearchResultItem, AttendanceRecord, Expense, Alert, ScheduleEntry, Payable, PurchaseOrder, ProductionLog, BidLineItem, Vehicle, MaintenanceLog, Quiz, Bid, Estimate, LegalDocument, Contract, Prospect, Opportunity, Supplier, DailyLog, GlobalSearchResult, PunchListItem, LogPhoto, DailyHours, Comment, Subcontractor } from '../types';
// FIX: Import Type for responseSchema
import { Type } from "@google/genai";

const handleApiError = (error: any, context: string): string => {
    console.error(`API Error in ${context}:`, error);
    if (error.message.includes('quota')) {
        return `Error: API quota exceeded for ${context}. Please wait and try again. If the problem persists, check your API key usage limits.`;
    }
    return `Error: An unexpected error occurred during ${context}. Please try again later.`;
};

const callGeminiApi = async (payload: any) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    return response.json();
};


// #region Existing Functions (Refactored for Proxy)
export const generatePerformanceSummary = async (employee: Employee): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Generate a performance summary for: Name: ${employee.name}, Job: ${employee.job}, Status: ${employee.isActive ? 'Active' : 'Inactive'}, Ratings (1-5): Quality: ${employee.rating.quality}, Speed: ${employee.rating.speed}, Autonomy: ${employee.rating.autonomy}, Proactivity: ${employee.rating.proactivity}, Punctuality: ${employee.rating.punctuality}, Attendance: ${employee.rating.attendance}, Availability: ${employee.rating.availability}, Obedience: ${employee.rating.obedience}, Problem Solving: ${employee.rating.problemSolving}, Specialty: ${employee.rating.specialty}, Specialty Description: "${employee.specialtyDescription || 'N/A'}"`,
            config: {
                systemInstruction: `You are an expert HR analyst in the construction industry. Write a professional, objective, and concise performance summary for an employee based on the provided data. The summary should be a single paragraph. Constructively highlight strengths and areas for improvement. Do not invent information. Only return the summary paragraph.`,
                temperature: 0.5
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return "Could not generate summary. Please try again later.";
    }
};

export const getPayrollAnalysis = async (currentWeekData: any, historicalData: any): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Current Week Payroll Data: ${JSON.stringify(currentWeekData)}\n\nHistorical Payroll Averages: ${JSON.stringify(historicalData)}\n\nBased on this, provide your analysis.`,
            config: {
                systemInstruction: `You are a financial analyst specializing in payroll for construction companies. Your task is to analyze the provided payroll data for the current week and compare it with historical averages. Provide a short, bulleted list of key observations. Focus on significant deviations, high overtime, or notable changes. Be concise and data-driven.`,
                temperature: 0.5
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error) {
        console.error("Gemini Payroll Analysis Error:", error);
        return "Could not perform payroll analysis at this time.";
    }
};

export const getAssignmentRecommendations = async (requirements: string, employees: Employee[]): Promise<{ employee: Employee; reason: string; }[]> => {
    const simplifiedEmployees = employees.map(e => ({ id: e.id, name: e.name, job: e.job, isActive: e.isActive, specialtyDescription: e.specialtyDescription, rating: { quality: e.rating.quality, speed: e.rating.speed, availability: e.rating.availability, autonomy: e.rating.autonomy } }));
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Job requirements: "${requirements}"`,
            config: {
                systemInstruction: `You are an expert construction project manager. Your task is to recommend the top 3 best employees for a job based on the user's requirements and the provided employee data. Analyze ratings, job titles, and specialties. Provide your response in a JSON object that matches the specified schema, containing an array of recommendations. For each recommendation, provide the employee's ID and a brief, compelling reason explaining why they are a good fit. Data: ${JSON.stringify(simplifiedEmployees)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { employeeId: { type: Type.STRING }, reason: { type: Type.STRING } } } } } },
                temperature: 0.6
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        const result = JSON.parse(data.text.trim());
        if (result && Array.isArray(result.recommendations)) {
            return result.recommendations.map((rec: { employeeId: string, reason: string }) => ({
                employee: employees.find(e => e.id === rec.employeeId)!,
                reason: rec.reason
            })).filter(item => !!item.employee);
        }
        return [];
    } catch (error) {
        console.error("Gemini Assignment Recs Error:", error);
        return [];
    }
};

export const analyzeSafetyImage = async (image: { mimeType: string, data: string }): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: "Analyze this jobsite image for safety hazards." }] },
            config: { systemInstruction: `You are a construction safety expert. Analyze the provided image of a jobsite and identify any potential safety hazards. Provide a concise, bulleted list of your findings and recommendations. If no hazards are found, state that the site appears safe from the visible angle.` },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Safety Image Analysis');
    }
};

export const analyzeReceipt = async (image: { mimeType: string, data: string }): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: "Extract information from this construction receipt." }] },
            config: { systemInstruction: `You are an OCR assistant for construction. Analyze the receipt image and extract key information like job description, materials listed with quantities, and total cost if available. Format the output as a clean, readable string. Example: "Job Description: Task X\\nMaterials: 20ft wire, 5 outlets\\nTotal: $125.50"` },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Receipt Analysis');
    }
};

export const analyzeExpenseReceipt = async (image: { mimeType: string, data: string }): Promise<Partial<Expense>> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: "Extract expense details from this receipt into the JSON schema." }] },
            config: {
                systemInstruction: `You are an OCR assistant for expense tracking in construction. Analyze the receipt image and extract the vendor, date, total amount, and a brief description. Suggest a relevant category. Provide the output in the specified JSON schema.`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, amount: { type: Type.NUMBER }, date: { type: Type.STRING }, category: { type: Type.STRING }, vendor: { type: Type.STRING } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error("Gemini Expense Receipt Analysis Error:", error);
        return { description: handleApiError(error, 'Expense Receipt Analysis') };
    }
};

export const interpretBlueprint = async (image: { mimeType: string, data: string }, question: string): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: `Based on the blueprint, answer the following question: "${question}"` }] },
            config: { systemInstruction: `You are an expert architect and construction planner. Answer questions about the provided blueprint image accurately and concisely.` },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Blueprint Interpretation');
    }
};

export const analyzeDefectImage = async (image: { mimeType: string, data: string }): Promise<{ description: string, suggestedAction: string }> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: "Analyze this defect image." }] },
            config: {
                systemInstruction: `You are a construction quality control expert. Analyze the image to identify a construction defect. Describe the defect and suggest a corrective action. Respond in the specified JSON format.`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, suggestedAction: { type: Type.STRING } }, required: ["description", "suggestedAction"] }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error("Gemini Defect Image Analysis Error:", error);
        return {
            description: handleApiError(error, 'Defect Image Analysis'),
            suggestedAction: "Please review the error and try again.",
        };
    }
};

export const analyzeJobsitePhoto = async (file: { mimeType: string, data: string }): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: file.mimeType, data: file.data } }, { text: "Analyze this jobsite photo for a daily log." }] },
            config: {
                systemInstruction: `You are a construction project manager. Briefly describe the construction progress or activity shown in the provided jobsite photo. Focus on key elements like framing, concrete, drywall, etc. Be concise.`,
                temperature: 0.3
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Jobsite Photo Analysis');
    }
};
// #endregion

// #region Newly Implemented Functions
export type SearchableData = {
    employees: Partial<Employee>[];
    clients: Partial<Client>[];
    jobsites: Partial<Jobsite>[];
    extraWorkTickets: ExtraWorkTicket[];
    tools: Tool[];
    materials: Material[];
    invoices: Invoice[];
    estimates: Estimate[];
    legalDocuments: LegalDocument[];
    contracts: Contract[];
    prospects: Prospect[];
    opportunities: Opportunity[];
    suppliers: Supplier[];
};

export const analyzeEmployeeRisks = async (employee: Employee): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Analyze employee: ${JSON.stringify({ name: employee.name, job: employee.job, isActive: employee.isActive, rating: employee.rating, specialty: employee.specialtyDescription })}`,
            config: { systemInstruction: `You are an expert HR risk analyst for construction companies. Analyze the provided employee data to identify potential risks like flight risk, safety concerns, or performance issues. Provide a concise, professional analysis in a single paragraph. Base your analysis only on the data provided.`, temperature: 0.5 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Employee Risk Analysis');
    }
};

// FIX: Add missing function 'analyzeComplianceDocuments' to fix an error in useAppStore.ts. This function uses Gemini to analyze employee and subcontractor compliance documents for expiration issues and generates alerts.
export const analyzeComplianceDocuments = async (employees: Employee[], subcontractors: Subcontractor[]): Promise<Omit<Alert, 'id'>[]> => {
    const simplifiedData = {
        employees: employees.map(e => ({ id: e.id, name: e.name, documents: e.documents?.map(d => ({ name: d.name, type: d.type, expirationDate: d.expirationDate })) || [] })),
        subcontractors: subcontractors.map(s => ({ id: s.id, name: s.name, documents: s.documents?.map(d => ({ name: d.name, type: d.type, expirationDate: d.expirationDate })) || [] })),
    };
    
    const today = new Date().toISOString().split('T')[0];

    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Analyze the compliance documents for the following employees and subcontractors. Today's date is ${today}.`,
            config: {
                systemInstruction: `You are a compliance officer for a construction company. Analyze the provided data to identify documents that are expired or will expire within the next 30 days. Generate a 'critical' alert for expired documents and a 'warning' alert for those expiring soon. Respond with a JSON array of alert objects according to the schema. Each alert must include the person's name in the message. Set the alert type to 'compliance'. Data: ${JSON.stringify(simplifiedData)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            message: { type: Type.STRING },
                            severity: { type: Type.STRING },
                            relatedTo: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    id: { type: Type.STRING }
                                },
                                required: ["type", "id"]
                            }
                        },
                        required: ["type", "message", "severity", "relatedTo"]
                    }
                }
            },
        }
    };

    try {
        const data = await callGeminiApi(payload);
        const results = JSON.parse(data.text.trim());
        if (Array.isArray(results)) {
            return results;
        }
        return [];
    } catch (error) {
        console.error("Gemini Compliance Analysis Error:", error);
        return [];
    }
};

export const getRachyOpinions = async (employees: Employee[], clients: Client[], jobsites: Jobsite[], timeLogs: TimeLog[]): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Data Snapshot:\n- ${employees.length} employees\n- ${clients.length} clients\n- ${jobsites.length} jobsites\n- Total hours logged in provided data: ${timeLogs.reduce((acc, log) => acc + Object.values(log.employeeHours).reduce((sum, week) => sum + Object.values(week).reduce((dsum, day) => dsum + day.regular + day.overtime, 0), 0), 0)}\n\nProvide your suggestions.`,
            config: { systemInstruction: `You are "Rachy," an AI business advisor for a construction company. Analyze the provided snapshot of company data. Generate 3-5 high-impact, actionable suggestions to improve profitability, efficiency, or safety. Present these as a bulleted list in markdown format. Be concise and insightful.`, temperature: 0.7 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Rachy Opinions');
    }
};

export const performGlobalSearch = async (query: string, searchableData: SearchableData): Promise<GlobalSearchResult> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `User query: "${query}"`,
            config: { 
                systemInstruction: `You are an AI search assistant for a construction management app. The user will provide a query and a JSON object containing all searchable data. Your task is to find the most relevant items (up to 10) across all data types that match the user's query. The query might be semantic (e.g., "available carpenters", "overdue invoices"). For each result, provide the item's ID, type, a display name, relevant details, and a brief reason why it matched. Respond ONLY with a JSON array matching the provided schema. Data: ${JSON.stringify(searchableData)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, name: { type: Type.STRING }, details: { type: Type.STRING }, matchReason: { type: Type.STRING } } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error(handleApiError(error, 'Global Search'));
        return [];
    }
};

export const generateClientProgressSummary = async (jobsite: Jobsite, productionLogs: ProductionLog[], extraWorkTickets: ExtraWorkTicket[]): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Write a client-facing progress summary for the project at ${jobsite.address}. Key progress points from logs: ${JSON.stringify(productionLogs.flatMap(p => p.tasks.map(t => t.description)))}. Approved change orders: ${extraWorkTickets.filter(t=>t.status === 'approved').length}.`,
            config: { systemInstruction: `You are a project manager writing a progress summary for a client. Be professional, positive, and concise. Do not invent information. Format the output as a simple paragraph.`, temperature: 0.6 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Client Progress Summary');
    }
};

export const predictVehicleMaintenance = async (vehicle: Vehicle, maintenanceLogs: MaintenanceLog[]): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Vehicle: ${JSON.stringify(vehicle)}. Maintenance History: ${JSON.stringify(maintenanceLogs)}. Predict the next 1-2 maintenance items needed (e.g., oil change, tire rotation) and suggest a timeframe or mileage. Be concise.`,
            config: { systemInstruction: "You are an expert fleet maintenance AI. Predict upcoming maintenance needs based on vehicle info and history.", temperature: 0.4 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Vehicle Maintenance Prediction');
    }
};

export const generateContractScope = async (contractTitle: string, clientName: string, contracts: Contract[]): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `New Contract Title: "${contractTitle}" for Client: "${clientName}".\n\nExample of past contract scopes: ${JSON.stringify(contracts.map(c => c.scopeOfWork))}\n\nGenerate a new scope of work.`,
            config: { systemInstruction: `You are a construction contract expert. Write a clear and concise scope of work for a new contract based on the title and client. Use past contracts as a style reference.`, temperature: 0.7 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Contract Scope Generation');
    }
};

export const generateForemanPerformanceAnalysis = async (foreman: Employee, kpis: any): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Analyze performance for Foreman ${foreman.name}. KPIs: ${JSON.stringify(kpis)}. Highlight strengths and areas for improvement in a brief paragraph.`,
            config: { systemInstruction: `You are an HR analyst. Provide a concise, data-driven performance analysis for a construction foreman based on the provided KPIs.`, temperature: 0.5 },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Foreman Performance Analysis');
    }
};

export const calculateProjectHealthScores = async (jobsites: Jobsite[], timeLogs: TimeLog[], expenses: Expense[], employees: Employee[], extraWorkTickets: ExtraWorkTicket[]): Promise<{ id: string; healthScore: { score: number; analysis: string; updatedAt: string; } }[]> => {
    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const promises = jobsites.map(async (jobsite) => {
        const laborCost = timeLogs.filter(log => log.jobsiteId === jobsite.id).reduce((total, log) => total + Object.entries(log.employeeHours).reduce((logTotal, [empId, week]) => {
            const employee = employeeMap.get(empId);
            if (!employee) return logTotal;
            const reg = Object.values(week).reduce((s, d) => s + d.regular, 0);
            const ot = Object.values(week).reduce((s, d) => s + d.overtime, 0);
            return logTotal + (reg * employee.hourlyRate) + (ot * employee.overtimeRate);
        }, 0), 0);

        const otherCosts = expenses.filter(ex => ex.jobsiteId === jobsite.id).reduce((sum, ex) => sum + ex.amount, 0);
        const actualCost = laborCost + otherCosts;
        const budget = Object.values(jobsite.budget).reduce((sum, val) => sum + val, 0);
        const openTickets = extraWorkTickets.filter(t => t.jobsiteId === jobsite.id && t.status === 'pending').length;

        const payload = {
            task: 'generateContent',
            params: {
                model: "gemini-2.5-flash",
                contents: `Project Data: ${JSON.stringify({ budget, actualCost, openTickets, status: jobsite.status })}`,
                config: {
                    systemInstruction: `You are a construction project health analyst. Based on the provided data for a jobsite, calculate a health score from 0-100 (100 is best) and provide a brief analysis. Consider budget vs actuals, and issues (tickets). Respond in the specified JSON format.`,
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING } }, required: ["score", "analysis"] }
                },
            }
        };
        
        try {
            const data = await callGeminiApi(payload);
            const result = JSON.parse(data.text.trim());
            return { id: jobsite.id, healthScore: { ...result, updatedAt: new Date().toISOString() } };
        } catch (error) {
            console.error(`Failed to get health score for ${jobsite.id}`, error);
            return { id: jobsite.id, healthScore: { score: 50, analysis: "Error during analysis.", updatedAt: new Date().toISOString() } };
        }
    });

    return Promise.all(promises);
};

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Address: "${address}"`,
            config: {
                systemInstruction: `You are a geocoding service. Return a JSON object with latitude and longitude for the given address. If you cannot find it, return null.`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { latitude: { type: Type.NUMBER }, longitude: { type: Type.NUMBER } }, required: ["latitude", "longitude"] }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        const result = JSON.parse(data.text.trim());
        return result.latitude && result.longitude ? result : null;
    } catch (error: any) {
        console.error(handleApiError(error, 'Geocoding'));
        return null;
    }
};

export const analyzeSafetyTrends = async (reports: SafetyReport[]): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Analyze these safety report summaries for trends: ${JSON.stringify(reports.map(r => r.analysis))}`,
            config: { systemInstruction: "You are a safety analyst. Find trends in safety reports and provide a summary with a recommendation." },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Safety Trend Analysis');
    }
};

export const suggestEmployeesForTicket = async (description: string, employees: Employee[]): Promise<{ employeeId: string, reason: string }[]> => {
    const simplifiedEmployees = employees.map(e => ({ id: e.id, name: e.name, job: e.job, specialtyDescription: e.specialtyDescription }));
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Ticket description: "${description}"`,
            config: {
                systemInstruction: `You are a construction dispatcher. Based on the ticket description, recommend suitable employees from the list. Respond with JSON containing an array of objects with 'employeeId' and 'reason'. Data: ${JSON.stringify(simplifiedEmployees)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { employeeId: { type: Type.STRING }, reason: { type: Type.STRING } } } } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        const result = JSON.parse(data.text.trim());
        return result.recommendations || [];
    } catch (error: any) {
        console.error(handleApiError(error, 'Employee Suggestion for Ticket'));
        return [];
    }
};

export const generateDailySummary = async (employees: Employee[], attendanceRecords: AttendanceRecord[], openTickets: ExtraWorkTicket[], toolsInMaintenance: Tool[], invoices: Invoice[], timeLogs: TimeLog[], date: Date): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Summarize for ${date.toDateString()}:\n- ${attendanceRecords.filter(r => r.date === date.toISOString().split('T')[0]).length} employees on site\n- ${openTickets.length} open tickets\n- ${toolsInMaintenance.length} tools in maintenance.`,
            config: { systemInstruction: `You are a construction PM creating a daily briefing. Summarize the provided data into a concise, professional, bulleted list using markdown.` },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Daily Summary Generation');
    }
};

export const optimizeSchedule = async (schedule: ScheduleEntry[], employees: Employee[], jobsites: Jobsite[]): Promise<{ schedule: ScheduleEntry[], reasoning: string }> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Data:\n- Schedule: ${JSON.stringify(schedule)}\n- Employees: ${JSON.stringify(employees.map(e => ({id: e.id, name: e.name, job: e.job})))}\n- Jobsites: ${JSON.stringify(jobsites.map(j => ({id: j.id, address: j.address})))}`,
            config: {
                systemInstruction: `You are a construction logistics expert. Analyze the schedule, employee list, and jobsite data. Suggest optimizations for efficiency. If none, say so. Respond with a JSON object containing the optimized 'schedule' array and a 'reasoning' string.`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { schedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, date: { type: Type.STRING }, jobsiteId: { type: Type.STRING }, employeeIds: { type: Type.ARRAY, items: { type: Type.STRING } } } } }, reasoning: { type: Type.STRING } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error(handleApiError(error, 'Schedule Optimization'));
        return { schedule, reasoning: "Could not optimize schedule due to an error." };
    }
};

export const generateProfitabilityAnalysis = async (data: any): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Analyze: ${JSON.stringify(data)}`,
            config: { systemInstruction: "You are a construction financial analyst. Analyze the project financial data and provide a concise summary of its profitability." },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Profitability Analysis');
    }
};

export const analyzeRFPForBid = async (rfpText: string): Promise<{ title: string, scopeOfWork: string, lineItems: BidLineItem[] }> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `RFP Text: "${rfpText}"`,
            config: {
                systemInstruction: `You are an expert bid estimator. Analyze the RFP text and extract the project title, a scope of work summary, and potential line items. Respond in the specified JSON format.`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, scopeOfWork: { type: Type.STRING }, lineItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, category: { type: Type.STRING }, description: { type: Type.STRING }, quantity: { type: Type.NUMBER }, unitCost: { type: Type.NUMBER }, total: { type: Type.NUMBER } } } } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error(handleApiError(error, 'RFP Analysis'));
        throw error;
    }
};

export const generateQuizFromManual = async (manualText: string): Promise<Quiz> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Manual text: "${manualText}"`,
            config: {
                systemInstruction: "You are a safety training instructor. Create a multiple-choice quiz from the provided manual text to test comprehension. Respond in the specified JSON format.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { questionText: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswerIndex: { type: Type.INTEGER } } } } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return JSON.parse(data.text.trim());
    } catch (error: any) {
        console.error(handleApiError(error, 'Quiz Generation'));
        throw error;
    }
};

export const generateAlerts = async (safetyReports: SafetyReport[]): Promise<Alert[]> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Reports: ${JSON.stringify(safetyReports.map(r => r.analysis))}`,
            config: {
                systemInstruction: "You are a construction safety officer. Analyze safety reports and generate critical or warning alerts for recurring issues. Respond in the specified JSON format.",
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, message: { type: Type.STRING }, severity: { type: Type.STRING } } } }
            },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        const alerts = JSON.parse(data.text.trim());
        return alerts.map((alert: Omit<Alert, 'id'>) => ({...alert, id: `alert-${Date.now()}-${Math.random()}`}));
    } catch (error: any) {
        console.error(handleApiError(error, 'Alert Generation'));
        return [];
    }
};

export const generateDailyLogSummary = async (data: { notes: string, photosWithAnalysis: LogPhoto[], personnelCount: number, tickets: ExtraWorkTicket[], safetyReports: SafetyReport[] }): Promise<string> => {
     const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Data: ${JSON.stringify(data)}`,
            config: { systemInstruction: "You are a project manager writing a daily log summary. Based on the data, write a concise summary of the day's progress and notable events." },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Daily Log Summary');
    }
};

export const generateProjectStatusReport = async (data: any): Promise<string> => {
    const payload = {
        task: 'generateContent',
        params: {
            model: "gemini-2.5-flash",
            contents: `Data for report: ${JSON.stringify(data)}`,
            config: { systemInstruction: "You are a project manager writing a weekly status report for stakeholders. Use the provided data to generate a professional, markdown-formatted report with sections for Financials, Personnel, Progress, and Concerns." },
        }
    };
    try {
        const data = await callGeminiApi(payload);
        return data.text.trim();
    } catch (error: any) {
        return handleApiError(error, 'Project Status Report');
    }
};
// #endregion