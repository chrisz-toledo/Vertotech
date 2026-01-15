import React from 'react';
import { Command } from '../hooks/useCommandPalette';
// Icons
import { HomeIcon } from '../components/icons/new/HomeIcon';
import { UsersGroupIcon } from '../components/icons/UsersGroupIcon';
import { BuildingIcon } from '../components/icons/BuildingIcon';
import { LocationMarkerIcon } from '../components/icons/LocationMarkerIcon';
import { UserPlusIcon } from '../components/icons/UserPlusIcon';
import { InvoiceIcon } from '../components/icons/new/InvoiceIcon';
import { BrainCircuitIcon } from '../components/icons/BrainCircuitIcon';
import { WandIcon } from '../components/icons/new/WandIcon';
import { CalculatorIcon } from '../components/icons/new/CalculatorIcon';
import { CreditCardIcon } from '../components/icons/new/CreditCardIcon';
import { ShoppingCartIcon } from '../components/icons/new/ShoppingCartIcon';
import { TicketIcon } from '../components/icons/new/TicketIcon';
import { PrinterIcon } from '../components/icons/new/PrinterIcon';
import { ChartPieIcon } from '../components/icons/new/ChartPieIcon';
import { HandshakeIcon } from '../components/icons/new/HandshakeIcon';
import { BookOpenIcon } from '../components/icons/new/BookOpenIcon';
import { TargetIcon } from '../components/icons/new/TargetIcon';
import { BullhornIcon } from '../components/icons/new/BullhornIcon';

type CommandContext = {
    t: (key: any) => string;
    setCurrentView: (view: any) => void;
    openModal: (id: any, props?: any) => void;
    openPeekPanel: (type: any, props?: any) => void;
    getOpinions: () => void;
};

export const getCommands = (ctx: CommandContext): Command[] => [
    // Navigation
    { id: 'view-dashboard', name: ctx.t('dashboard'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('dashboard'), icon: React.createElement(HomeIcon, { className: "w-5 h-5" }) },
    { id: 'view-project-center', name: ctx.t('project-center'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('project-center'), icon: React.createElement(TargetIcon, { className: "w-5 h-5" }) },
    { id: 'view-analytics', name: ctx.t('analytics'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('analytics'), icon: React.createElement(ChartPieIcon, { className: "w-5 h-5" }) },
    { id: 'view-crm', name: ctx.t('opportunities'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('crm'), icon: React.createElement(HandshakeIcon, { className: "w-5 h-5" }) },
    { id: 'view-employees', name: ctx.t('employees'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('employees'), icon: React.createElement(UsersGroupIcon, { className: "w-5 h-5" }) },
    { id: 'view-clients', name: ctx.t('clients'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('clients'), icon: React.createElement(BuildingIcon, { className: "w-5 h-5" }) },
    { id: 'view-jobsites', name: ctx.t('jobsites'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('jobsites'), icon: React.createElement(LocationMarkerIcon, { className: "w-5 h-5" }) },
    { id: 'view-daily-logs', name: ctx.t('daily-logs'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('daily-logs'), icon: React.createElement(BookOpenIcon, { className: "w-5 h-5" }) },
    { id: 'view-invoices', name: ctx.t('invoices'), section: ctx.t('navigation'), action: () => ctx.setCurrentView('invoices'), icon: React.createElement(InvoiceIcon, { className: "w-5 h-5" }) },
    
    // Quick Actions
    { id: 'add-prospect', name: ctx.t('addProspect'), section: ctx.t('quickActions'), action: () => ctx.openModal('prospect'), icon: React.createElement(BullhornIcon, { className: "w-5 h-5" }) },
    { id: 'add-opportunity', name: ctx.t('addOpportunity'), section: ctx.t('quickActions'), action: () => ctx.openModal('opportunity'), icon: React.createElement(HandshakeIcon, { className: "w-5 h-5" }) },
    { id: 'add-employee', name: ctx.t('addEmployee'), section: ctx.t('quickActions'), action: () => ctx.openPeekPanel('employee', {}), icon: React.createElement(UserPlusIcon, { className: "w-5 h-5" }) },
    { id: 'add-client', name: ctx.t('addClient'), section: ctx.t('quickActions'), action: () => ctx.openPeekPanel('client', {}), icon: React.createElement(BuildingIcon, { className: "w-5 h-5" }) },
    { id: 'add-jobsite', name: ctx.t('addJobsite'), section: ctx.t('quickActions'), action: () => ctx.openModal('jobsite'), icon: React.createElement(LocationMarkerIcon, { className: "w-5 h-5" }) },
    { id: 'add-invoice', name: ctx.t('addInvoice'), section: ctx.t('quickActions'), action: () => ctx.openModal('invoiceDetails', { isManual: true }), icon: React.createElement(InvoiceIcon, { className: "w-5 h-5" }) },
    { id: 'add-estimate', name: ctx.t('addEstimate'), section: ctx.t('quickActions'), action: () => ctx.openModal('estimate'), icon: React.createElement(CalculatorIcon, { className: "w-5 h-5" }) },
    { id: 'add-expense', name: ctx.t('addExpense'), section: ctx.t('quickActions'), action: () => ctx.openModal('expense'), icon: React.createElement(CreditCardIcon, { className: "w-5 h-5" }) },
    { id: 'add-po', name: ctx.t('addPO'), section: ctx.t('quickActions'), action: () => ctx.openModal('purchaseOrder'), icon: React.createElement(ShoppingCartIcon, { className: "w-5 h-5" }) },
    { id: 'create-ticket', name: ctx.t('createTicket'), section: ctx.t('quickActions'), action: () => ctx.openModal('extraWorkTicket'), icon: React.createElement(TicketIcon, { className: "w-5 h-5" }) },
    { id: 'run-payroll', name: ctx.t('runPayroll'), section: ctx.t('quickActions'), action: () => ctx.openModal('runPayroll'), icon: React.createElement(PrinterIcon, { className: "w-5 h-5" }) },

    // AI Assistants
    { id: 'assignment-assistant', name: ctx.t('assignmentAssistant'), section: ctx.t('aiAssistants'), action: () => ctx.openModal('assignmentAssistant'), icon: React.createElement(WandIcon, { className: "w-5 h-5" }) },
    { id: 'rachy-opinions', name: ctx.t('rachyOpinions'), section: ctx.t('aiAssistants'), action: () => { ctx.openModal('opinions'); ctx.getOpinions(); }, icon: React.createElement(BrainCircuitIcon, { className: "w-5 h-5" }) },
];
