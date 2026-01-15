

import { v4 as uuidv4 } from 'uuid';
import type { Employee, EmployeeRating, Client, Jobsite, JobsiteStatus, Tool, Material, Expense, Payable, ScheduleEntry, DetailedBudget, PurchaseOrder, Subcontractor, PettyCashTransaction, JobRole, Contract, ProductionLog, Bid, PunchList, Vehicle, MaintenanceLog, ComplianceDocument, Estimate, ExtraWorkTicket, Invoice, LegalDocument, PriceItem, Prospect, Opportunity, Supplier, EmployeeRole, TimeLog, SafetyReport, DailyLog, LeaveRequest, BalanceEntry } from '../types';

export const initialCompanyInfo = {
    name: "Future Constructions Inc.",
    logoUrl: "https://images.unsplash.com/photo-1581094369393-d421714401a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
};

const initialEmployeeNames = [
  "Santiago Ruiz", "Angel Robles", "Jorge Avila", "Noel Hernandez", "Alan Medina",
  "Marlon Suñiga", "Kevin Cornejo", "Carlos Zuniga", "Juan Monico", "Julio Lujan",
  "Erick Gutierrez", "Derbis Anael Banegas", "Omar Mendoza", "Christian Hernandez",
  "Macario Choc", "Pedro Perez", "Jose Tinajero", "Hugo Velazquez", "Julio Ibarra",
  "Artilio Thomas", "Angel Rivas", "Mario Lopez", "Elvis Chacon", "Gregorio Hernandez",
  "Manuel Gonzalez", "Ricardo Santos", "Luis Fernandez", "Javier Morales", "David Jimenez"
];

const payRates = [22, 25, 28, 20, 30, 24, 26, 23, 27, 21, 29, 22.5, 25.5, 28.5, 20.5, 30.5, 24.5, 26.5, 23.5, 27.5, 21.5, 29.5, 22.75, 25.75, 31, 23, 28, 26, 32];

export const initialJobRoles: JobRole[] = [
    { name: "Labor", description: "General labor tasks, including site cleanup, material transport, and assisting skilled trades." },
    { name: "Carpenter", description: "Expert in cutting, shaping, and installing building materials during the construction of structures." },
    { name: "Foreman", description: "Supervises the construction crew, coordinates tasks, ensures safety protocols, and reports progress to management." },
    { name: "Painter", description: "Applies paint, stains, and coatings to walls, buildings, and other structures." },
    { name: "Concrete Finisher", description: "Smoothes and finishes surfaces of poured concrete, such as floors, sidewalks, roads, or curbs." },
    { name: "Drywall Installer", description: "Installs wallboard to ceilings or interior walls of buildings." },
    { name: "Framing", description: "Specializes in building the wooden framework or skeleton of a building." },
    { name: "Project Manager", description: "Oversees projects from conception to completion, ensuring they are on time and within budget." },
    { name: "Owner", description: "Business owner with full administrative privileges." },
];

export const initialSafetyTips: string[] = [
    "Always wear your hard hat on site.",
    "Inspect your tools before each use.",
    "Report any unsafe conditions to your foreman immediately.",
    "Keep your work area clean and free of trip hazards.",
    "Use fall protection when working at heights of 6 feet or more.",
    "Never work under a suspended load.",
    "Be aware of your surroundings, including heavy equipment.",
    "Ensure proper ventilation when working in confined spaces."
];

const generateRandomRating = (): EmployeeRating => ({
  quality: Math.floor(Math.random() * 3) + 3,
  speed: Math.floor(Math.random() * 3) + 3,
  proactivity: Math.floor(Math.random() * 3) + 3,
  autonomy: Math.floor(Math.random() * 3) + 3,
  punctuality: Math.floor(Math.random() * 4) + 2,
  attendance: Math.floor(Math.random() * 4) + 2,
  availability: Math.floor(Math.random() * 4) + 2,
  obedience: Math.floor(Math.random() * 4) + 2,
  problemSolving: Math.floor(Math.random() * 3) + 3,
  specialty: Math.floor(Math.random() * 3) + 3,
});

export const generateInitialEmployees = (): Employee[] => {
    const employees: Employee[] = [];
    const jobRoles = initialJobRoles.map(r => r.name);
    initialEmployeeNames.forEach((name, index) => {
        let job = jobRoles[index % jobRoles.length];
        if (index === 0) job = "Project Manager";
        if (index === 1 || index === 2) job = "Foreman";


        const employeeRole = (initialJobRoles.map(r => r.name) as EmployeeRole[]).includes(job as EmployeeRole) ? job as EmployeeRole : 'Labor';
        
        const hourlyRate = payRates[index % payRates.length];
        const id = uuidv4();
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        let documents: ComplianceDocument[] = [];
        if (job === 'Foreman' || job === 'Project Manager') {
            documents.push({
                id: `doc-emp-${id}-1`, name: 'OSHA 30 Certification', type: 'certification', 
                uploadedAt: new Date().toISOString(), expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                file: { mimeType: 'application/pdf', objectUrl: '', name: 'OSHA 30 Certification' }
            });
        }
        if (index % 5 === 0) {
             documents.push({
                id: `doc-emp-${id}-2`, name: 'Driver License', type: 'license', 
                uploadedAt: new Date().toISOString(), expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                file: { mimeType: 'application/pdf', objectUrl: '', name: 'Driver License' }
            });
        }
        
        const outstandingBalance = index % 7 === 0 ? Math.random() * 500 : 0;
        const balanceHistory: BalanceEntry[] = [];
        if (outstandingBalance > 0) {
            balanceHistory.push({
                id: `bal-init-${id}`,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: 'debit',
                amount: outstandingBalance,
                description: 'Initial balance carried over',
            });
        }

        employees.push({
            id,
            name,
            phone1: `555-123-${4500 + index}`,
            phone2: '',
            job,
            role: employeeRole,
            ssn: null,
            hourlyRate,
            overtimeRate: hourlyRate * 1.5,
            photoUrl: `https://i.pravatar.cc/150?u=${name.replace(/\s+/g, '')}`,
            isActive: Math.random() > 0.1,
            rating: generateRandomRating(),
            specialtyDescription: '',
            documents,
            createdAt,
            balanceHistory,
        });
    });
    return employees;
};

export const initialClients: Client[] = [
    { id: 'client-1', type: 'company', name: 'Apex Builders', contactPerson: 'John Smith', phone1: '555-0101', phone2: '', email: 'john@apexbuilders.com', address: '123 Construction Way', isActive: true, rating: { ppeProvision: 4, toolProvision: 5, picky: 3, payment: 5, communication: 4, problemSolving: 4 }, retentionPercentage: 10, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'client-2', type: 'individual', name: 'Maria Garcia', contactPerson: '', phone1: '555-0102', phone2: '', email: 'maria.g@email.com', address: '456 Residential Rd', isActive: true, rating: { ppeProvision: 3, toolProvision: 3, picky: 4, payment: 5, communication: 5, problemSolving: 3 }, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'client-3', type: 'company', name: 'Prestige Homes', contactPerson: 'Jane Doe', phone1: '555-0103', phone2: '', email: 'jane@prestige.com', address: '789 Luxury Blvd', isActive: false, rating: { ppeProvision: 5, toolProvision: 5, picky: 5, payment: 4, communication: 3, problemSolving: 3 }, retentionPercentage: 5, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'client-4', type: 'company', name: 'Bock Co., Inc.', contactPerson: '', phone1: '(612) 332-6809', phone2: '', email: 'info@bockco.com', address: '300 N 2nd Street, Suite 101, Minneapolis, MN 55401', isActive: true, rating: { ppeProvision: 3, toolProvision: 3, picky: 3, payment: 3, communication: 3, problemSolving: 3 }, retentionPercentage: 0, createdAt: new Date().toISOString() },
    { id: 'client-5', type: 'company', name: 'Summit Renovations', contactPerson: 'Emily White', phone1: '555-0105', phone2: '555-0106', email: 'emily@summitreno.com', address: '555 High Point Ave', isActive: true, rating: { ppeProvision: 4, toolProvision: 4, picky: 2, payment: 5, communication: 5, problemSolving: 4 }, retentionPercentage: 0, createdAt: new Date(Date.now() - 60 * 24*60*60*1000).toISOString() }
];

const detailedBudget1: DetailedBudget = { labor: 25000, materials: 15000, subcontractors: 5000, miscellaneous: 5000 };
const detailedBudget2: DetailedBudget = { labor: 40000, materials: 25000, subcontractors: 10000, miscellaneous: 0 };
const detailedBudget3: DetailedBudget = { labor: 60000, materials: 35000, subcontractors: 15000, miscellaneous: 2000 };
const detailedBudget4: DetailedBudget = { labor: 120000, materials: 75000, subcontractors: 30000, miscellaneous: 10000 };

export const initialJobsites: Jobsite[] = [
    { id: 'jobsite-1', clientId: 'client-1', address: '101 Main Street, Anytown, CA, 90210, United States', street: '101 Main Street', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'United States', buildingType: 'office', unit: 'Suite 200', status: 'in_progress', budget: detailedBudget1, healthScore: { score: 85, analysis: 'On track, slightly under budget on materials.', updatedAt: new Date().toISOString() } },
    { id: 'jobsite-2', clientId: 'client-1', address: '202 Oak Avenue, Anytown, CA, 90210, United States', street: '202 Oak Avenue', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'United States', buildingType: 'building', unit: '', status: 'not_started', budget: detailedBudget2 },
    { id: 'jobsite-3', clientId: 'client-3', address: '303 Pine Lane, Sometown, TX, 75001, United States', street: '303 Pine Lane', city: 'Sometown', state: 'TX', zipCode: '75001', country: 'United States', buildingType: 'house', unit: '', status: 'completed', budget: detailedBudget3 },
    { id: 'jobsite-4', clientId: 'client-5', address: '742 Evergreen Terrace, Springfield, IL', street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zipCode: '62704', country: 'United States', buildingType: 'house', unit: '', status: 'in_progress', budget: detailedBudget4 }
];

export const initialEstimates: Estimate[] = [
    { id: 'est-1', estimateNumber: '00001', clientId: 'client-1', date: new Date().toISOString().split('T')[0], status: 'sent', lineItems: [{id: 'li-est-1', category: 'Labor', description: 'Framing', quantity: 80, unitCost: 55, total: 4400}], subtotal: 4400, taxRate: 0.08, taxAmount: 352, total: 4752, createdAt: new Date().toISOString() }
];

export const initialLegalDocuments: LegalDocument[] = [
    { id: 'legal-1', name: 'General Liability Insurance Policy', type: 'insurance', issuer: 'AllState', issueDate: new Date(Date.now() - 300 * 24*60*60*1000).toISOString().split('T')[0], expirationDate: new Date(Date.now() + 65 * 24*60*60*1000).toISOString().split('T')[0], file: { mimeType: 'application/pdf', objectUrl: '', name: 'General Liability Insurance Policy' }, createdAt: new Date().toISOString() }
];

export const initialPriceItems: PriceItem[] = [
    { id: 'price-1', category: 'Labor', description: 'General Laborer Rental', unit: 'hour', rate: 35, createdAt: new Date().toISOString() },
    { id: 'price-2', category: 'Labor', description: 'Carpenter Rental', unit: 'hour', rate: 55, createdAt: new Date().toISOString() },
    { id: 'price-3', category: 'Finishes', description: 'Taping Out (Level 4)', unit: 'sq ft', rate: 2.50, createdAt: new Date().toISOString() },
    { id: 'price-4', category: 'Structure', description: 'Metal Frame (up to 8\' high)', unit: 'linear ft', rate: 12.00, createdAt: new Date().toISOString() },
    { id: 'price-5', category: 'Structure', description: 'Metal Frame (up to 10\' high)', unit: 'linear ft', rate: 15.50, createdAt: new Date().toISOString() },
];

export const initialTools: Tool[] = [
    { id: 'tool-1', name: 'DeWalt Hammer Drill', type: 'Power Tool', status: 'available', assignment: { type: 'warehouse', warehouseName: 'Main Warehouse', assignedAt: new Date().toISOString() }, purchaseDate: '2022-01-15', value: 150, serialNumber: 'DWHD-12345' },
    { id: 'tool-2', name: 'Makita Circular Saw', type: 'Power Tool', status: 'in_use', assignment: { type: 'jobsite', jobsiteId: 'jobsite-1', assignedAt: new Date().toISOString() }, purchaseDate: '2022-03-20', value: 200, serialNumber: 'MCS-67890' },
    { id: 'tool-3', name: 'Bosch Jackhammer', type: 'Heavy Equipment', status: 'in_maintenance', assignment: { type: 'unassigned' }, purchaseDate: '2021-05-10', value: 1200, maintenanceDetails: { startDate: new Date().toISOString().split('T')[0], estimatedReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], shopName: 'Pro Repairs' } },
];

export const initialMaterials: Material[] = [
    { id: 'mat-1', name: '2x4 Lumber - 8ft', sku: 'LUM-248', quantity: 200, unit: 'pieces', location: { type: 'warehouse', name: 'Main Warehouse' } },
    { id: 'mat-2', name: '5/8" Drywall Sheet', sku: 'DRY-5848', quantity: 50, unit: 'sheets', location: { type: 'jobsite', jobsiteId: 'jobsite-1' } },
    { id: 'mat-3', name: 'Quick-set Concrete Mix', sku: 'CON-QS80', quantity: 30, unit: 'bags', location: { type: 'jobsite', jobsiteId: 'jobsite-1' } },
];

export const initialMaterialUnits: string[] = ['pieces', 'sheets', 'bags', 'gallons', 'lbs', 'ft'];

export const initialExpenses: Expense[] = [
    { id: 'exp-1', description: 'Fuel for company truck', amount: 75.50, date: new Date(Date.now() - 2 * 24*60*60*1000).toISOString().split('T')[0], category: 'Fuel', vendor: 'Gas Station', employeeId: '4LBR$22$50$SRZTIAOG$$' },
    { id: 'exp-2', description: 'Lunch for the crew', amount: 120.00, date: new Date(Date.now() - 3 * 24*60*60*1000).toISOString().split('T')[0], category: 'Meals', jobsiteId: 'jobsite-1' },
];

export const initialExpenseCategories: string[] = ['Fuel', 'Materials', 'Meals', 'Tools', 'Subcontractor', 'Nómina', 'Pago de Saldo'];

export const initialPayables: Payable[] = [
    { id: 'pay-1', supplierId: 'supplier-1', invoiceNumber: 'LW-9876', description: 'Framing lumber supply', amountDue: 5500, amountPaid: 0, issueDate: '2023-10-01', dueDate: new Date(Date.now() + 10 * 24*60*60*1000).toISOString().split('T')[0], status: 'unpaid', category: 'Materials' },
    { id: 'pay-2', supplierId: 'supplier-2', invoiceNumber: 'PE-1122', description: 'Rough-in electrical work', amountDue: 8000, amountPaid: 4000, issueDate: '2023-09-25', dueDate: new Date(Date.now() - 5 * 24*60*60*1000).toISOString().split('T')[0], status: 'partially_paid', category: 'Subcontractor' },
];

export const initialPayableCategories: string[] = ['Materials', 'Subcontractor', 'Rent', 'Utilities'];

export const initialSchedule: ScheduleEntry[] = [
    { id: 'sched-1', date: new Date().toISOString().split('T')[0], jobsiteId: 'jobsite-1', employeeIds: ['4LBR$22$50$SRZTIAOG$$', '9CRPNTR$25$00$ARBLNGEA$$'] }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'po-1', poNumber: `PO-${new Date().getFullYear()}-001`, supplierId: 'supplier-1', date: new Date().toISOString().split('T')[0], jobsiteId: 'jobsite-1', lineItems: [{id: 'li-1', description: '2x4 Lumber', quantity: 100, unitPrice: 8.50, total: 850}], subtotal: 850, tax: 74.38, total: 924.38, status: 'sent' },
];

export const initialPettyCashTransactions: PettyCashTransaction[] = [
    { id: 'pc-1', type: 'income', date: new Date(Date.now() - 7 * 24*60*60*1000).toISOString().split('T')[0], description: 'Initial cash float', amount: 500 },
    { id: 'pc-2', type: 'expense', date: new Date(Date.now() - 1 * 24*60*60*1000).toISOString().split('T')[0], description: 'Box of screws', amount: 25.50, category: 'Materials', employeeId: '4LBR$22$50$SRZTIAOG$$' }
];

export const initialPettyCashCategories: string[] = ['Materials', 'Fuel', 'Office Supplies', 'Miscellaneous'];

export const initialSubcontractors: Subcontractor[] = [
    { id: 'sub-1', name: 'Pro Electricals', trade: 'Electrical', contactPerson: 'Mike Spark', phone: '555-0201', email: 'mike@proelec.com', documents: [{id: 'doc-sub-1', name: 'Liability Insurance', type: 'insurance', uploadedAt: new Date().toISOString(), expirationDate: new Date(Date.now() + 20 * 24*60*60*1000).toISOString().split('T')[0], file: {mimeType: 'application/pdf', objectUrl: '', name: 'Liability Insurance'}}] },
    { id: 'sub-2', name: 'Flow Plumbing', trade: 'Plumbing', contactPerson: 'Pete Pipe', phone: '555-0202', email: 'pete@flow.com', documents: [] },
];

export const initialContracts: Contract[] = [
    { id: 'contract-1', clientId: 'client-1', jobsiteId: 'jobsite-1', title: 'Contract for 101 Main St', scopeOfWork: 'Full framing and drywall for new construction.', startDate: '2023-09-01', endDate: '2024-03-01', totalAmount: 150000, status: 'in_progress', createdAt: '2023-08-25' },
];

export const initialProductionLogs: ProductionLog[] = [
    { id: 'plog-1', date: new Date().toISOString().split('T')[0], jobsiteId: 'jobsite-1', responsible: { type: 'employees', ids: ['9CRPNTR$25$00$ARBLNGEA$$'] }, tasks: [{id: 'pt-1', description: 'Framed west wall', quantity: 1, unit: 'wall'}], createdAt: new Date().toISOString() },
];

export const initialProductivityUnits: string[] = ['wall', 'sq ft', 'linear ft', 'room'];

export const initialBids: Bid[] = [
    { id: 'bid-1', bidNumber: '00001', clientId: 'client-3', title: 'New Custom Home Bid', projectAddress: '404 New Project Rd', date: new Date().toISOString().split('T')[0], status: 'enviada', scopeOfWork: 'Build a new custom home from foundation to finish.', lineItems: [], subtotal: 250000, tax: 0, total: 250000, createdAt: new Date().toISOString() },
];

export const initialPunchLists: PunchList[] = [
    { id: 'pl-1', jobsiteId: 'jobsite-3', name: 'Final Walkthrough', items: [{id: 'pli-1', description: 'Touch-up paint in master bedroom', location: 'Master Bedroom', status: 'abierto', createdAt: new Date().toISOString() }], createdAt: new Date().toISOString() },
];

export const initialVehicles: Vehicle[] = [
    { id: 'veh-1', name: 'Ford F-150 #1', type: 'Truck', licensePlate: 'TRUCK-01', purchaseDate: '2022-01-01', initialCost: 45000, status: 'operational' },
    { id: 'veh-2', name: 'Bobcat Skid Steer', type: 'Heavy Equipment', purchaseDate: '2021-06-15', initialCost: 65000, status: 'in_repair' },
];

export const initialMaintenanceLogs: MaintenanceLog[] = [
    { id: 'maint-1', vehicleId: 'veh-1', date: new Date(Date.now() - 30 * 24*60*60*1000).toISOString().split('T')[0], description: 'Oil Change', cost: 120 },
];

export const initialProspects: Prospect[] = [
    { id: 'prospect-1', name: 'Innovate Corp', contactPerson: 'Sarah Chen', phone: '555-0301', email: 'sarah@innovate.com', source: 'Referral', createdAt: new Date().toISOString() },
    { id: 'prospect-2', name: 'David Lee', phone: '555-0302', email: 'david.lee@email.com', source: 'Website', createdAt: new Date().toISOString() },
];

export const initialOpportunities: Opportunity[] = [
    { id: 'opp-1', title: 'Innovate Corp Office Remodel', prospectId: 'prospect-1', estimatedValue: 120000, status: 'proposal_sent', communicationLogs: [], createdAt: new Date().toISOString() },
    { id: 'opp-2', title: 'Lee Residence Kitchen', prospectId: 'prospect-2', estimatedValue: 45000, status: 'contacted', communicationLogs: [], createdAt: new Date().toISOString() },
    { id: 'opp-3', title: 'New Warehouse Project', prospectId: 'prospect-1', estimatedValue: 500000, status: 'lead', communicationLogs: [], createdAt: new Date().toISOString() },
];

export const initialSuppliers: Supplier[] = [
    { id: 'supplier-1', name: 'Lumber World', trade: 'Lumber Supply', contactPerson: 'Greg', phone: '555-0401', createdAt: new Date().toISOString() },
    { id: 'supplier-2', name: 'Pro Electricals', trade: 'Electrical Supply', contactPerson: 'Mike', phone: '555-0402', createdAt: new Date().toISOString() },
];


interface DemoData {
    employees: Employee[];
    clients: Client[];
    subcontractors: Subcontractor[];
    suppliers: Supplier[];
    jobsites: Jobsite[];
    extraWorkTickets: ExtraWorkTicket[];
    invoices: Invoice[];
    estimates: Estimate[];
    legalDocuments: LegalDocument[];
    priceItems: PriceItem[];
    prospects: Prospect[];
    opportunities: Opportunity[];
    timeLogs: TimeLog[];
    tools: Tool[];
    materials: Material[];
    expenses: Expense[];
    payables: Payable[];
    purchaseOrders: PurchaseOrder[];
    pettyCashTransactions: PettyCashTransaction[];
    contracts: Contract[];
    productionLogs: ProductionLog[];
    bids: Bid[];
    punchLists: PunchList[];
    vehicles: Vehicle[];
    maintenanceLogs: MaintenanceLog[];
    safetyReports: SafetyReport[];
    dailyLogs: DailyLog[];
    leaveRequests: LeaveRequest[];
}

export const demoData: DemoData = {
    employees: generateInitialEmployees(),
    clients: initialClients,
    subcontractors: initialSubcontractors,
    suppliers: initialSuppliers,
    jobsites: initialJobsites,
    extraWorkTickets: [
        { id: 'ewt-demo-1', ticketNumber: '0001', clientId: 'client-1', jobsiteId: 'jobsite-1', date: new Date().toISOString().split('T')[0], description: 'Extra wiring for kitchen island', employeeIds: ['9CRPNTR$25$00$ARBLNGEA$$'], hours: 4, status: 'approved', requestedBy: 'John Smith', signature: '', createdAt: new Date().toISOString(), costImpact: 220, changeOrderId: 'co-1', category: 'client_request' },
        { id: 'ewt-demo-2', ticketNumber: '0002', clientId: 'client-5', jobsiteId: 'jobsite-4', date: new Date(Date.now() - 2 * 24*60*60*1000).toISOString().split('T')[0], description: 'Repaint north wall due to color mismatch.', employeeIds: ['5PNTR$28$00$JLHNDNLA$$'], hours: 8, status: 'pending', requestedBy: 'Emily White', signature: '', createdAt: new Date().toISOString(), costImpact: 224, category: 'rework' }
    ],
    invoices: [
        { id: 'inv-demo-1', invoiceNumber: '00001', clientId: 'client-1', status: 'paid', issueDate: new Date(Date.now() - 40 * 24*60*60*1000).toISOString().split('T')[0], dueDate: new Date(Date.now() - 10 * 24*60*60*1000).toISOString().split('T')[0], lineItems: [{ id: 'li-demo-1', description: 'Phase 1 - Framing', quantity: 1, unitPrice: 15000, amount: 15000 }], subtotal: 15000, taxRate: 0, taxAmount: 0, total: 15000, notes: '', createdAt: new Date().toISOString() },
        { id: 'inv-demo-2', invoiceNumber: '00002', clientId: 'client-3', status: 'sent', issueDate: new Date(Date.now() - 5 * 24*60*60*1000).toISOString().split('T')[0], dueDate: new Date(Date.now() + 25 * 24*60*60*1000).toISOString().split('T')[0], lineItems: [{ id: 'li-demo-2', description: 'Initial Deposit', quantity: 1, unitPrice: 25000, amount: 25000 }], subtotal: 25000, taxRate: 0, taxAmount: 0, total: 25000, notes: '', createdAt: new Date().toISOString() },
        { id: 'inv-demo-3', invoiceNumber: '00003', clientId: 'client-5', status: 'sent', issueDate: new Date(Date.now() - 45 * 24*60*60*1000).toISOString().split('T')[0], dueDate: new Date(Date.now() - 15 * 24*60*60*1000).toISOString().split('T')[0], lineItems: [{ id: 'li-demo-3', description: 'Phase 2 - Drywall', quantity: 1, unitPrice: 35000, amount: 35000 }], subtotal: 35000, taxRate: 0.07, taxAmount: 2450, total: 37450, notes: '', createdAt: new Date().toISOString() }
    ],
    estimates: [
        { id: 'est-demo-1', estimateNumber: '00001', clientId: 'client-1', date: new Date().toISOString().split('T')[0], status: 'approved', lineItems: [{id: 'li-est-demo-1', category: 'Labor', description: 'Framing', quantity: 80, unitCost: 55, total: 4400}], subtotal: 4400, taxRate: 0.08, taxAmount: 352, total: 4752, createdAt: new Date().toISOString() }
    ],
    legalDocuments: initialLegalDocuments,
    priceItems: initialPriceItems,
    prospects: initialProspects,
    opportunities: initialOpportunities,
    timeLogs: [],
    tools: initialTools,
    materials: initialMaterials,
    expenses: initialExpenses,
    payables: initialPayables,
    purchaseOrders: initialPurchaseOrders,
    pettyCashTransactions: initialPettyCashTransactions,
    contracts: initialContracts,
    productionLogs: initialProductionLogs,
    bids: initialBids,
    punchLists: initialPunchLists,
    vehicles: initialVehicles,
    maintenanceLogs: initialMaintenanceLogs,
    safetyReports: [
        { id: 'safety-1', image: { mimeType: 'image/jpeg', objectUrl: '', name: 'Safety Report Image' }, analysis: 'Site appears clear, but one worker near the scaffolding is not wearing a hard hat. Recommendation: Enforce hard hat policy at all times.', createdAt: new Date().toISOString() }
    ],
    dailyLogs: [
        { id: `${new Date(Date.now() - 1 * 24*60*60*1000).toISOString().split('T')[0]}-jobsite-1`, jobsiteId: 'jobsite-1', date: new Date(Date.now() - 1 * 24*60*60*1000).toISOString().split('T')[0], notes: 'Completed framing on the east wall. Awaiting plumbing inspection.', photos: [], summary: 'Framing progress is good on the east wall. Next step is plumbing inspection.', createdAt: new Date().toISOString()}
    ],
    leaveRequests: [
        { id: 'leave-1', employeeId: '4LBR$22$50$SRZTIAOG$$', type: 'vacation', startDate: new Date(Date.now() + 10 * 24*60*60*1000).toISOString().split('T')[0], endDate: new Date(Date.now() + 15 * 24*60*60*1000).toISOString().split('T')[0], status: 'pending', createdAt: new Date().toISOString() }
    ]
};