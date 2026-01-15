

import React from 'react';
import { HomeIcon } from '../components/icons/new/HomeIcon';
import { UsersGroupIcon } from '../components/icons/UsersGroupIcon';
import { BuildingIcon } from '../components/icons/BuildingIcon';
import { LocationMarkerIcon } from '../components/icons/LocationMarkerIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ShieldCheckIcon } from '../components/icons/new/ShieldCheckIcon';
import { TicketIcon } from '../components/icons/new/TicketIcon';
import { InvoiceIcon } from '../components/icons/new/InvoiceIcon';
import { FolderIcon } from '../components/icons/new/FolderIcon';
import { ToolboxIconSimple } from '../components/icons/new/ToolboxIcon';
import { CreditCardIcon } from '../components/icons/new/CreditCardIcon';
import { ReceiptIcon } from '../components/icons/new/ReceiptIcon';
import { CalendarIcon } from '../components/icons/new/CalendarIcon';
import { ShoppingCartIcon } from '../components/icons/new/ShoppingCartIcon';
import { CashIcon } from '../components/icons/new/CashIcon';
import { PrinterIcon } from '../components/icons/new/PrinterIcon';
import { GanttChartIcon } from '../components/icons/new/GanttChartIcon';
import { CoinsIcon } from '../components/icons/new/CoinsIcon';
import { FileSignatureIcon } from '../components/icons/new/FileSignatureIcon';
import { ChartBarIcon } from '../components/icons/new/ChartBarIcon';
import { GavelIcon } from '../components/icons/new/GavelIcon';
import { ClipboardListIcon } from '../components/icons/new/ClipboardListIcon';
import { CertificateIcon } from '../components/icons/new/CertificateIcon';
import { TruckIcon } from '../components/icons/new/TruckIcon';
import { CalculatorIcon } from '../components/icons/new/CalculatorIcon';
import { PriceTagIcon } from '../components/icons/new/PriceTagIcon';
import { ScaleIcon } from '../components/icons/new/ScaleIcon';
import { BriefcaseIcon } from '../components/icons/new/BriefcaseIcon';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';
import { BullhornIcon } from '../components/icons/new/BullhornIcon';
import { HandshakeIcon } from '../components/icons/new/HandshakeIcon';
import { SupplierIcon } from '../components/icons/new/SupplierIcon';
import { ChartPieIcon } from '../components/icons/new/ChartPieIcon';
import { BookOpenIcon } from '../components/icons/new/BookOpenIcon';
import { TargetIcon } from '../components/icons/new/TargetIcon';
import { ViewType } from '../types';
import { ModalId } from '../hooks/useModalManager';
import { ClipboardCheckIcon } from '../components/icons/new/ClipboardCheckIcon';
import { SlidersIcon } from '../components/icons/new/SlidersIcon';

type NavItem = {
    id: ViewType;
    icon: React.ReactNode;
    action?: { type: 'modal', id: ModalId } | { type: 'view', id: ViewType };
};

export type NavGroup = {
    id: string;
    labelKey: 'general' | 'people' | 'finance' | 'operations' | 'sales-crm';
    icon: React.ReactNode;
    items: NavItem[];
    requiredRoles?: string[];
};

export const getNavGroupDefinitions = (): NavGroup[] => [
    {
        id: 'general',
        labelKey: 'general',
        icon: React.createElement(HomeIcon, { className: "w-5 h-5" }),
        items: [
            { id: 'dashboard', icon: React.createElement(HomeIcon, { className: "w-5 h-5" }) },
            { id: 'my-day', icon: React.createElement(ClipboardCheckIcon, { className: "w-5 h-5" }) },
            { id: 'project-center', icon: React.createElement(TargetIcon, { className: "w-5 h-5" }) },
            { id: 'analytics', icon: React.createElement(ChartPieIcon, { className: "w-5 h-5" }) },
        ]
    },
    {
        id: 'sales-crm',
        labelKey: 'sales-crm',
        icon: React.createElement(BullhornIcon, { className: "w-5 h-5" }),
        items: [
            { id: 'crm', icon: React.createElement(HandshakeIcon, { className: "w-5 h-5" }) },
            { id: 'prospects', icon: React.createElement(BullhornIcon, { className: "w-5 h-5" }) },
        ],
        requiredRoles: ['Owner', 'Project Manager']
    },
    {
        id: 'people',
        labelKey: 'people',
        icon: React.createElement(UsersGroupIcon, { className: "w-5 h-5" }),
        items: [
            { id: 'employees', icon: React.createElement(UsersGroupIcon, { className: "w-5 h-5" }) },
            { id: 'clients', icon: React.createElement(BuildingIcon, { className: "w-5 h-5" }) },
            { id: 'subcontractors', icon: React.createElement(GanttChartIcon, { className: "w-5 h-5" }) },
            { id: 'leave-requests', icon: React.createElement(CalendarIcon, { className: "w-5 h-5" }) },
        ]
    },
    {
        id: 'finance',
        labelKey: 'finance',
        icon: React.createElement(DollarSignIcon, { className: "w-5 h-5" }),
        items: [
            { id: 'invoices', icon: React.createElement(InvoiceIcon, { className: "w-5 h-5" }) },
            { id: 'estimates', icon: React.createElement(CalculatorIcon, { className: "w-5 h-5" }) },
            { id: 'payroll', icon: React.createElement(PrinterIcon, { className: "w-5 h-5" }) },
            { id: 'expenses', icon: React.createElement(CreditCardIcon, { className: "w-5 h-5" }) },
            { id: 'payables', icon: React.createElement(ReceiptIcon, { className: "w-5 h-5" }) },
            { id: 'purchase-orders', icon: React.createElement(ShoppingCartIcon, { className: "w-5 h-5" }) },
            { id: 'suppliers', icon: React.createElement(SupplierIcon, { className: "w-5 h-5" }) },
            { id: 'petty-cash', icon: React.createElement(CashIcon, { className: "w-5 h-5" }) },
            { id: 'balance', icon: React.createElement(CoinsIcon, { className: "w-5 h-5" }) },
            { id: 'prices', icon: React.createElement(PriceTagIcon, { className: "w-5 h-5" }), action: { type: 'modal', id: 'prices' } }
        ],
        requiredRoles: ['Owner', 'Project Manager']
    },
    {
        id: 'operations',
        labelKey: 'operations',
        icon: React.createElement(BriefcaseIcon, { className: "w-5 h-5" }),
        items: [
            { id: 'jobsites', icon: React.createElement(LocationMarkerIcon, { className: "w-5 h-5" }) },
            { id: 'daily-logs', icon: React.createElement(BookOpenIcon, { className: "w-5 h-5" }) },
            { id: 'planning', icon: React.createElement(CalendarIcon, { className: "w-5 h-5" }) },
            { id: 'time-tracking', icon: React.createElement(ClockIcon, { className: "w-5 h-5" }) },
            { id: 'productivity', icon: React.createElement(ChartBarIcon, { className: "w-5 h-5" }) },
            { id: 'extra-work', icon: React.createElement(TicketIcon, { className: "w-5 h-5" }) },
            { id: 'inventory', icon: React.createElement(ToolboxIconSimple, { className: "w-5 h-5" }) },
            { id: 'fleet', icon: React.createElement(TruckIcon, { className: "w-5 h-5" }) },
            { id: 'safety', icon: React.createElement(ShieldCheckIcon, { className: "w-5 h-5" }) },
            { id: 'documents', icon: React.createElement(FolderIcon, { className: "w-5 h-5" }) },
            { id: 'contracts', icon: React.createElement(FileSignatureIcon, { className: "w-5 h-5" }) },
            { id: 'bids', icon: React.createElement(GavelIcon, { className: "w-5 h-5" }) },
            { id: 'tasks', icon: React.createElement(ClipboardListIcon, { className: "w-5 h-5" }) },
            { id: 'training', icon: React.createElement(CertificateIcon, { className: "w-5 h-5" }) },
            { id: 'legal', icon: React.createElement(ScaleIcon, { className: "w-5 h-5" }) },
        ],
         requiredRoles: ['Owner', 'Project Manager', 'Foreman']
    },
];