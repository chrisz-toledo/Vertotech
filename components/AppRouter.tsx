import React from 'react';
import { useAppStore } from '../hooks/stores/useAppStore';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useCrmStore } from '../hooks/stores/useCrmStore';
import { useFinanceStore } from '../hooks/stores/useFinanceStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useAiStore } from '../hooks/stores/useAiStore';
import { useModalManager } from '../hooks/useModalManager';

// UI Components
import Dashboard from './new/Dashboard';
import EmployeeList from './EmployeeList';
import ClientList from './ClientList';
import JobsiteList from './new/JobsiteList';
import TimeLogView from './TimeLogView';
import SafetyView from './new/SafetyView';
import ExtraWorkTicketList from './new/ExtraWorkTicketList';
import InvoiceList from './new/InvoiceList';
import DocumentHub from './new/DocumentHub';
import InventoryView from './new/InventoryView';
import ExpenseList from './new/ExpenseList';
import PayableList from './new/PayableList';
import PlanningView from './new/PlanningView';
import PurchaseOrderList from './new/PurchaseOrderList';
import PettyCashView from './new/PettyCashView';
import PayrollView from './new/PayrollView';
import SubcontractorList from './new/SubcontractorList';
import BalanceView from './new/BalanceView';
import ContractList from './new/ContractList';
import ProductivityView from './new/ProductivityView';
import BidsView from './new/BidsView';
import QualityControlView from './new/QualityControlView';
import TrainingView from './new/TrainingView';
import FleetView from './new/FleetView';
import EstimatesView from './new/EstimatesView';
import LegalView from './new/LegalView';
import ReportsView from './new/ReportsView';
import CRMView from '../features/crm/CRMView';
import ProspectListView from '../features/crm/ProspectListView';
import SupplierList from './new/SupplierList';
import DailyLogView from './new/DailyLogView';
import ProjectCenterView from './new/ProjectCenterView';
import MyDayView from './new/my-day/MyDayView';
import { LeaveRequestView } from '../features/people/LeaveRequestView';

const AppRouter: React.FC = () => {
    const { open: openModal } = useModalManager();
    const currentView = useAppStore(s => s.currentView);
    const peopleStore = usePeopleStore();
    const crmStore = useCrmStore();
    const financeStore = useFinanceStore();
    const operationsStore = useOperationsStore();
    const appStore = useAppStore();

    switch (currentView) {
        case 'dashboard': return <Dashboard />;
        case 'my-day': return <MyDayView />;
        case 'project-center': return <ProjectCenterView />;
        case 'crm': return <CRMView opportunities={crmStore.opportunities} prospects={crmStore.prospects} onOpenOpportunity={(opp) => openModal('opportunity', { opportunity: opp })} />;
        case 'prospects': return <ProspectListView />;
        case 'employees': return <EmployeeList />;
        case 'clients': return <ClientList />;
        case 'subcontractors': return <SubcontractorList 
            subcontractors={peopleStore.subcontractors} 
            onAdd={() => openModal('subcontractor')}
            onEdit={(sub) => openModal('subcontractor', { subcontractor: sub })}
            onDelete={(sub) => appStore.confirm({ title: 'Eliminar Subcontratista', message: `Mover ${sub.name} a la papelera?`, onConfirm: () => peopleStore.deleteSubcontractor([sub.id])})}
        />;
        case 'leave-requests': return <LeaveRequestView />;
        case 'suppliers': return <SupplierList />;
        case 'jobsites': return <JobsiteList />;
        case 'daily-logs': return <DailyLogView />;
        case 'contracts': return <ContractList 
            contracts={operationsStore.contracts}
            clients={peopleStore.clients}
            jobsites={operationsStore.jobsites}
            onAdd={() => openModal('contract')}
            onEdit={(contract) => openModal('contract', { contract })}
            onDelete={(contract) => appStore.confirm({ title: 'Eliminar Contrato', message: `Mover '${contract.title}' a la papelera?`, onConfirm: () => operationsStore.deleteContract([contract.id])})}
        />;
        case 'bids': return <BidsView 
            bids={operationsStore.bids}
            clients={peopleStore.clients}
            onAdd={() => openModal('bid')}
            onEdit={(bid) => openModal('bid', { bid })}
            onDelete={(bid) => appStore.confirm({ title: 'Eliminar Licitación', message: `Mover '${bid.title}' a la papelera?`, onConfirm: () => operationsStore.deleteBid([bid.id])})}
            onUpdateStatus={(id, status) => operationsStore.saveBid({ ...operationsStore.bids.find(b => b.id === id), status }, id)}
        />;
        case 'tasks': return <QualityControlView 
            jobsites={operationsStore.jobsites}
            punchLists={operationsStore.punchLists}
            onEditPunchList={(pl) => openModal('punchList', { punchList: pl })}
            onDeletePunchList={(pl) => appStore.confirm({ title: 'Eliminar Lista', message: `Mover '${pl.name}' a la papelera?`, onConfirm: () => operationsStore.deletePunchList([pl.id])})}
            onSavePunchList={(pl) => operationsStore.savePunchList(pl, pl.id)}
        />;
        case 'planning': return <PlanningView />;
        case 'time-tracking': return <TimeLogView />;
        case 'productivity': return <ProductivityView 
            productionLogs={operationsStore.productionLogs}
            jobsites={operationsStore.jobsites}
            employees={peopleStore.employees}
            subcontractors={peopleStore.subcontractors}
            onAdd={() => openModal('productionLog')}
            onEdit={(log) => openModal('productionLog', { log })}
            onDelete={(log) => appStore.confirm({ title: 'Eliminar Registro', message: 'Mover a la papelera?', onConfirm: () => operationsStore.deleteProductionLog([log.id])})}
        />;
        case 'extra-work': return <ExtraWorkTicketList />;
        case 'payroll': return <PayrollView 
            payrollRuns={financeStore.payrollRuns}
            onRunPayroll={() => openModal('runPayroll')}
            onPrintChecks={(run) => openModal('printChecks', { payrollRun: run })}
            onEditPayrollRun={(run) => openModal('runPayroll', { payrollRun: run })}
        />;
        case 'balance': return <BalanceView employees={peopleStore.employees} onOpenSpecialPaymentModal={(emp) => openModal('specialPayment', { employee: emp })} />;
        case 'invoices': return <InvoiceList />;
        case 'estimates': return <EstimatesView
            estimates={financeStore.estimates}
            clients={peopleStore.clients}
            onAdd={() => openModal('estimate')}
            onEdit={(est) => openModal('estimate', { estimate: est })}
            onDelete={(est) => appStore.confirm({ title: 'Eliminar Estimado', message: 'Mover a la papelera?', onConfirm: () => financeStore.deleteEstimate([est.id])})}
        />;
        case 'purchase-orders': return <PurchaseOrderList />;
        case 'payables': return <PayableList />;
        case 'petty-cash': return <PettyCashView />;
        case 'expenses': return <ExpenseList />;
        case 'inventory': return <InventoryView />;
        case 'fleet': return <FleetView 
            vehicles={operationsStore.vehicles}
            maintenanceLogs={operationsStore.maintenanceLogs}
            onAdd={() => openModal('vehicle')}
            onEdit={(v) => openModal('vehicle', { vehicle: v })}
            onDelete={(v) => appStore.confirm({ title: 'Eliminar Vehículo', message: 'Mover a la papelera?', onConfirm: () => operationsStore.deleteVehicle([v.id])})}
            onPredictMaintenance={(v) => useAiStore.getState().getVehicleMaintenancePrediction(v.id).then(() => openModal('aiContent'))}
        />;
        case 'training': return <TrainingView 
            employees={peopleStore.employees}
            onOpenQuizGenerator={() => openModal('quizGenerator')}
        />;
        case 'safety': return <SafetyView />;
        case 'analytics': return <ReportsView />;
        case 'documents': return <DocumentHub />;
        case 'legal': return <LegalView 
            documents={operationsStore.legalDocuments}
            onAdd={() => openModal('legal')}
            onEdit={(doc) => openModal('legal', { legalDocument: doc })}
            onDelete={(doc) => appStore.confirm({ title: 'Eliminar Documento', message: 'Mover a la papelera?', onConfirm: () => operationsStore.deleteLegalDocument([doc.id])})}
        />;
        default: return <Dashboard />;
    }
};

export default AppRouter;