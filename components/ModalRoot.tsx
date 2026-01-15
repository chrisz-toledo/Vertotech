import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Hooks
import { useModalManager } from '../hooks/useModalManager';
import { useAppStore } from '../hooks/stores/useAppStore';
import { usePeopleStore } from '../hooks/stores/usePeopleStore';
import { useCrmStore } from '../hooks/stores/useCrmStore';
import { useFinanceStore } from '../hooks/stores/useFinanceStore';
import { useOperationsStore } from '../hooks/stores/useOperationsStore';
import { useAiStore } from '../hooks/stores/useAiStore';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { usePeekPanel } from '../hooks/usePeekPanel';
import { getCommands } from '../config/commands';

// All Modal Components
import { JobsiteModal } from './new/JobsiteModal';
import { TimeLogModal } from './TimeLogModal';
import { QRScannerModal } from './QRScannerModal';
import { TrashModal } from './TrashModal';
import { ConfirmationModal } from './ConfirmationModal';
import { AIGeneratedContentModal } from './new/AIGeneratedContentModal';
import { AssignmentAssistantModal } from './new/AssignmentAssistantModal';
import { OpinionsModal } from './new/OpinionsModal';
import { ExtraWorkTicketModal } from './new/ExtraWorkTicketModal';
import { InvoiceGeneratorModal } from './new/InvoiceGeneratorModal';
import { InvoiceDetailsModal } from './new/InvoiceDetailsModal';
import { ToolModal } from './new/ToolModal';
import { MaterialModal } from './new/MaterialModal';
import { ExpenseModal } from './new/ExpenseModal';
import { PayableModal } from './new/PayableModal';
import ScheduleEntryModal from './new/ScheduleEntryModal';
import { BlueprintInterpreterModal } from './new/BlueprintInterpreterModal';
import { PurchaseOrderModal } from './new/PurchaseOrderModal';
import { PettyCashModal } from './new/PettyCashModal';
import RunPayrollModal from './new/RunPayrollModal';
import PrintChecksModal from './new/PrintChecksModal';
import { SubcontractorModal } from './new/SubcontractorModal';
import SpecialPaymentModal from './new/SpecialPaymentModal';
import { ContractModal } from './new/ContractModal';
import { ProductionLogModal } from './new/ProductionLogModal';
import { BidModal } from './new/BidModal';
import { PunchListModal } from './new/PunchListModal';
import { QuizGeneratorModal } from './new/QuizGeneratorModal';
import { VehicleModal } from './new/VehicleModal';
import { CommandPaletteModal } from './new/CommandPaletteModal';
import { EstimateModal } from './new/EstimateModal';
import { LegalModal } from './new/LegalModal';
import { PricesModal } from './new/PricesModal';
import { PriceItemModal } from './new/PriceItemModal';
import { ControlPanelModal } from './new/ControlPanelModal';
import { ProspectModal } from './new/ProspectModal';
import { OpportunityModal } from './new/OpportunityModal';
import { SupplierModal } from './new/SupplierModal';
import { ToolCheckinModal } from './new/ToolCheckinModal';
import { QuoteRequestModal } from './new/QuoteRequestModal';
import { BulkEditModal } from './new/BulkEditModal';
import { DailyLogModal } from './new/DailyLogModal';
import { LeaveRequestModal } from '../features/people/LeaveRequestModal';
import { BalanceHistoryModal } from './new/BalanceHistoryModal';


export const ModalRoot: React.FC = () => {
    // Modal Manager for standard modals
    const { activeModal, props: modalProps, close: closeModal, open: openModal } = useModalManager();
    
    // Specific state for confirmation and command palette
    const appStore = useAppStore();
    const { confirmationState, closeConfirmation, handleConfirm } = appStore;

    // Command Palette hooks
    const { t } = useTranslation();
    const { open: openPeekPanel } = usePeekPanel();
    const aiStore = useAiStore();
    const commandContext = { t, setCurrentView: appStore.setCurrentView, openModal, openPeekPanel, getOpinions: aiStore.getOpinions };
    const commands = useMemo(() => getCommands(commandContext), [t, appStore.setCurrentView, openModal, openPeekPanel, aiStore.getOpinions]);
    
    const { 
        isOpen: isPaletteOpen, 
        closePalette, 
        query: paletteQuery, 
        setQuery: setPaletteQuery, 
        filteredCommands 
    } = useCommandPalette(commands);
    
    // Zustand Stores for props
    const peopleStore = usePeopleStore();
    const crmStore = useCrmStore();
    const financeStore = useFinanceStore();
    const operationsStore = useOperationsStore();

    return (
        <>
            {/* Standard Modals */}
            <JobsiteModal isOpen={activeModal === 'jobsite'} onClose={closeModal} editingJobsite={modalProps.jobsite} prefillData={modalProps.prefillData} />
            <TimeLogModal isOpen={activeModal === 'timeLog'} onClose={closeModal} />
            <QRScannerModal isOpen={activeModal === 'qrScanner'} onClose={closeModal} />
            <TrashModal isOpen={activeModal === 'trash'} onClose={closeModal} />
            <AIGeneratedContentModal isOpen={activeModal === 'aiContent'} onClose={closeModal} {...aiStore.aiContent} />
            <AssignmentAssistantModal isOpen={activeModal === 'assignmentAssistant'} onClose={closeModal} />
            <OpinionsModal isOpen={activeModal === 'opinions'} onClose={closeModal} />
            <ExtraWorkTicketModal isOpen={activeModal === 'extraWorkTicket'} onClose={closeModal} editingTicket={modalProps.ticket} prefillData={modalProps.prefillData} onSave={operationsStore.saveExtraWorkTicket} onAnalyzeReceipt={aiStore.getReceiptAnalysis} clients={peopleStore.clients} jobsites={operationsStore.jobsites} employees={peopleStore.employees} />
            <InvoiceGeneratorModal isOpen={activeModal === 'invoiceGenerator'} onClose={closeModal} onGenerateInvoice={financeStore.saveInvoice} clients={peopleStore.clients} timeLogs={operationsStore.timeLogs} extraWorkTickets={operationsStore.extraWorkTickets} employees={peopleStore.employees} />
            <InvoiceDetailsModal isOpen={activeModal === 'invoiceDetails'} onClose={closeModal} invoice={modalProps.invoice} isManual={modalProps.isManual} prefillData={modalProps.prefillData} clients={peopleStore.clients} onSaveInvoice={financeStore.saveInvoice} />
            <EstimateModal isOpen={activeModal === 'estimate'} onClose={closeModal} editingEstimate={modalProps.estimate} onSave={financeStore.saveEstimate} clients={peopleStore.clients} financialSettings={appStore.financialSettings} />
            <ToolModal isOpen={activeModal === 'tool'} onClose={closeModal} editingTool={modalProps.tool} onSave={operationsStore.saveTool} employees={peopleStore.employees} jobsites={operationsStore.jobsites} />
            <MaterialModal isOpen={activeModal === 'material'} onClose={closeModal} editingMaterial={modalProps.material} onSave={operationsStore.saveMaterial} jobsites={operationsStore.jobsites} materialUnits={appStore.materialUnits} onAddMaterialUnit={appStore.addMaterialUnit} />
            <ExpenseModal isOpen={activeModal === 'expense'} onClose={closeModal} editingExpense={modalProps.expense} prefillData={modalProps.prefillData} onSave={financeStore.saveExpense} jobsites={operationsStore.jobsites} employees={peopleStore.employees} expenseCategories={appStore.expenseCategories} onAddCategory={appStore.addExpenseCategory} />
            <PayableModal isOpen={activeModal === 'payable'} onClose={closeModal} editingPayable={modalProps.payable} onSave={financeStore.savePayable} categories={appStore.payableCategories} onAddCategory={appStore.addPayableCategory} suppliers={peopleStore.suppliers} prefillData={modalProps.prefillData} />
            <ScheduleEntryModal isOpen={activeModal === 'scheduleEntry'} onClose={closeModal} initialDate={modalProps.date} onSave={operationsStore.saveScheduleEntry} jobsites={operationsStore.jobsites} employees={peopleStore.employees} />
            <BlueprintInterpreterModal isOpen={activeModal === 'blueprintInterpreter'} onClose={closeModal} />
            <PurchaseOrderModal isOpen={activeModal === 'purchaseOrder'} onClose={closeModal} editingPO={modalProps.po} onSave={financeStore.savePurchaseOrder} jobsites={operationsStore.jobsites} onCreatePayable={financeStore.savePayable} suppliers={peopleStore.suppliers} />
            <PettyCashModal isOpen={activeModal === 'pettyCash'} onClose={closeModal} editingTransaction={modalProps.transaction} onSave={financeStore.savePettyCashTransaction} employees={peopleStore.employees} categories={appStore.pettyCashCategories} onAddCategory={appStore.addPettyCashCategory} />
            <RunPayrollModal isOpen={activeModal === 'runPayroll'} onClose={closeModal} editingPayrollRun={modalProps.payrollRun} onSavePayrollRun={financeStore.savePayrollRun} employees={peopleStore.employees} timeLogs={operationsStore.timeLogs} />
            <PrintChecksModal isOpen={activeModal === 'printChecks'} onClose={closeModal} payrollRun={modalProps.payrollRun} companyInfo={appStore.companyInfo} financialSettings={appStore.financialSettings} employees={peopleStore.employees} onMarkAsPaid={financeStore.markPayrollRunAsPaid} />
            <SubcontractorModal isOpen={activeModal === 'subcontractor'} onClose={closeModal} editingSubcontractor={modalProps.subcontractor} onSave={peopleStore.saveSubcontractor} />
            <SpecialPaymentModal isOpen={activeModal === 'specialPayment'} onClose={closeModal} employee={modalProps.employee} />
            <ContractModal isOpen={activeModal === 'contract'} onClose={closeModal} editingContract={modalProps.contract} onSave={operationsStore.saveContract} clients={peopleStore.clients} jobsites={operationsStore.jobsites} />
            <ProductionLogModal isOpen={activeModal === 'productionLog'} onClose={closeModal} editingLog={modalProps.log} prefillData={modalProps.prefillData} onSave={operationsStore.saveProductionLog} jobsites={operationsStore.jobsites} employees={peopleStore.employees} subcontractors={peopleStore.subcontractors} units={appStore.productivityUnits} />
            <BidModal isOpen={activeModal === 'bid'} onClose={closeModal} editingBid={modalProps.bid} onSave={operationsStore.saveBid} clients={peopleStore.clients} />
            <PunchListModal isOpen={activeModal === 'punchList'} onClose={closeModal} editingPunchList={modalProps.punchList} onSave={operationsStore.savePunchList} employees={peopleStore.employees} />
            <QuizGeneratorModal isOpen={activeModal === 'quizGenerator'} onClose={closeModal} />
            <VehicleModal isOpen={activeModal === 'vehicle'} onClose={closeModal} editingVehicle={modalProps.vehicle} onSave={operationsStore.saveVehicle} />
            <LegalModal isOpen={activeModal === 'legal'} onClose={closeModal} editingDocument={modalProps.legalDocument} onSave={operationsStore.saveLegalDocument} />
            <PricesModal isOpen={activeModal === 'prices'} onClose={closeModal} priceItems={financeStore.priceItems} onAdd={() => openModal('priceItem')} onEdit={(item) => openModal('priceItem', { item })} onDelete={(item) => appStore.confirm({ title: 'Eliminar Tarifa', message: '¿Eliminar permanentemente esta tarifa?', onConfirm: () => financeStore.deletePriceItem(item.id)})} />
            <PriceItemModal isOpen={activeModal === 'priceItem'} onClose={closeModal} editingItem={modalProps.item} onSave={financeStore.savePriceItem} />
            <ControlPanelModal isOpen={activeModal === 'controlPanel'} onClose={closeModal} />
            <ProspectModal isOpen={activeModal === 'prospect'} onClose={closeModal} editingProspect={modalProps.prospect} onSave={crmStore.saveProspect} />
            <OpportunityModal isOpen={activeModal === 'opportunity'} onClose={closeModal} editingOpportunity={modalProps.opportunity} onSave={crmStore.saveOpportunity} prospects={crmStore.prospects} />
            <SupplierModal isOpen={activeModal === 'supplier'} onClose={closeModal} editingSupplier={modalProps.supplier} onSave={peopleStore.saveSupplier} />
            <ToolCheckinModal isOpen={activeModal === 'toolCheckin'} onClose={closeModal} tools={operationsStore.tools} employees={peopleStore.employees} jobsites={operationsStore.jobsites} onCheckIn={operationsStore.checkInTool} onCheckOut={operationsStore.checkOutTool} />
            <QuoteRequestModal isOpen={activeModal === 'quoteRequest'} onClose={closeModal} editingRequest={modalProps.request} onSave={financeStore.saveQuoteRequest} suppliers={peopleStore.suppliers} />
            <BulkEditModal isOpen={activeModal === 'bulkEdit'} onClose={closeModal} itemType={modalProps.itemType} ids={modalProps.ids} />
            <DailyLogModal isOpen={activeModal === 'dailyLog'} onClose={closeModal} />
            <LeaveRequestModal isOpen={activeModal === 'leaveRequest'} onClose={closeModal} />
            <BalanceHistoryModal isOpen={activeModal === 'balanceHistory'} onClose={closeModal} employee={modalProps.employee} />

            {/* Special Modals */}
            <ConfirmationModal isOpen={confirmationState.isOpen} onClose={closeConfirmation} onConfirm={handleConfirm} {...confirmationState} />
            <CommandPaletteModal isOpen={isPaletteOpen} onClose={closePalette} commands={filteredCommands} query={paletteQuery} setQuery={setPaletteQuery} />
        </>
    );
};