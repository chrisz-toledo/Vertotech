import React, { useState, useMemo } from 'react';
import type { Invoice, InvoiceLineItem, Client, TimeLog, ExtraWorkTicket, Employee } from '../../types';
import { XCircleIcon } from '../icons/XCircleIcon';
import { InvoiceIcon } from '../icons/new/InvoiceIcon';
import { formatCurrency } from '../../utils/formatters';

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

interface InvoiceGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateInvoice: (invoiceData: any) => void;
    clients: Client[];
    timeLogs: TimeLog[];
    extraWorkTickets: ExtraWorkTicket[];
    employees: Employee[];
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({ isOpen, onClose, onGenerateInvoice, clients, timeLogs, extraWorkTickets, employees }) => {
    
    const [selectedClientId, setSelectedClientId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
    const [notes, setNotes] = useState('');
    const [taxRate, setTaxRate] = useState(0.0); // No tax by default
    const [isPreviewing, setIsPreviewing] = useState(false);

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

    const handleFindBillableItems = () => {
        if (!selectedClientId || !startDate || !endDate) {
            alert("Por favor seleccione un cliente y un rango de fechas.");
            return;
        }

        const newStartDate = new Date(`${startDate}T00:00:00Z`);
        const newEndDate = new Date(`${endDate}T23:59:59Z`);

        const items: InvoiceLineItem[] = [];
        let itemId = 0;

        const relevantTimeLogs = timeLogs.filter(log => {
            const logStartDate = new Date(log.weekStartDate);
            return log.clientId === selectedClientId && logStartDate >= newStartDate && logStartDate <= newEndDate;
        });
        
        const employeeHoursMap = new Map<string, { regular: number; overtime: number }>();
        relevantTimeLogs.forEach(log => {
            for (const [empId, week] of Object.entries(log.employeeHours)) {
                const employee = employeeMap.get(empId);
                if (employee?.isActive) {
                    const current = employeeHoursMap.get(empId) || { regular: 0, overtime: 0 };
                    Object.values(week).forEach(day => {
                        current.regular += day.regular;
                        current.overtime += day.overtime;
                    });
                    employeeHoursMap.set(empId, current);
                }
            }
        });

        employeeHoursMap.forEach((hours, empId) => {
            const employee = employeeMap.get(empId);
            if (!employee) return;
            if (hours.regular > 0) {
                items.push({ id: `item-${itemId++}`, description: `Servicios Regulares - ${employee.name}`, quantity: hours.regular, unitPrice: employee.hourlyRate, amount: hours.regular * employee.hourlyRate, sourceType: 'timelog' });
            }
            if (hours.overtime > 0) {
                items.push({ id: `item-${itemId++}`, description: `Servicios Overtime - ${employee.name}`, quantity: hours.overtime, unitPrice: employee.overtimeRate, amount: hours.overtime * employee.overtimeRate, sourceType: 'timelog' });
            }
        });

        const relevantTickets = extraWorkTickets.filter(ticket =>
            ticket.clientId === selectedClientId &&
            ticket.status === 'approved' &&
            new Date(`${ticket.date}T00:00:00Z`) >= newStartDate &&
            new Date(`${ticket.date}T00:00:00Z`) <= newEndDate
        );

        relevantTickets.forEach(ticket => {
            let ticketCost = 0;
            // Simplified cost calculation: total hours * first employee's rate
            const primaryEmployee = employeeMap.get(ticket.employeeIds[0]);
            if (primaryEmployee) {
                ticketCost = ticket.hours * primaryEmployee.hourlyRate; 
            }
            if (ticketCost > 0) {
                 items.push({ id: `item-${itemId++}`, description: `Ticket Trabajo Extra #${ticket.ticketNumber}: ${ticket.description}`, quantity: ticket.hours, unitPrice: primaryEmployee?.hourlyRate || 0, amount: ticketCost, sourceId: ticket.id, sourceType: 'extrawork' });
            }
        });
        
        setLineItems(items);
        setIsPreviewing(true);
    };
    
    const { subtotal, taxAmount, total } = useMemo(() => {
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }, [lineItems, taxRate]);

    const handleGenerate = () => {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 30);

        onGenerateInvoice({ clientId: selectedClientId, status: 'draft', issueDate: toISODateString(today), dueDate: toISODateString(dueDate), lineItems, subtotal, taxRate, taxAmount, total, notes });
        handleClose();
    };
    
    const handleClose = () => {
        setIsPreviewing(false);
        setSelectedClientId('');
        setStartDate('');
        setEndDate('');
        setLineItems([]);
        setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={handleClose}>
            <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh] max-h-[900px]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200"><div className="flex items-center gap-3"><InvoiceIcon className="w-6 h-6 text-emerald-600"/><h2 className="text-2xl font-bold text-gray-900">Generador de Facturas</h2></div><button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-100"><XCircleIcon className="w-8 h-8"/></button></header>
                <main className="p-6 sm:p-8 overflow-y-auto bg-white space-y-6">
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b ${isPreviewing ? 'opacity-50' : ''}`}>
                        <div><label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">Cliente</label><select id="clientId" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} required className="w-full p-3 bg-white border rounded-lg" disabled={isPreviewing}><option value="" disabled>Seleccione un cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full p-3 border rounded-lg" disabled={isPreviewing} /></div>
                        <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full p-3 border rounded-lg" disabled={isPreviewing} /></div>
                        <div className="md:col-span-3"><button onClick={handleFindBillableItems} disabled={!selectedClientId || !startDate || !endDate || isPreviewing} className="w-full p-3 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-gray-400">Buscar Items Facturables</button></div>
                    </div>

                    {isPreviewing && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800">Previsualización de Factura</h3>
                            {lineItems.length > 0 ? (
                                <>
                                <div className="max-h-60 overflow-y-auto border rounded-lg"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium uppercase">Descripción</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Cant.</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Precio Unit.</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Monto</th></tr></thead><tbody className="divide-y">{lineItems.map(item => (<tr key={item.id}><td className="px-4 py-2 text-sm">{item.description}</td><td className="px-4 py-2 text-right text-sm">{item.quantity.toFixed(2)}</td><td className="px-4 py-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td><td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(item.amount)}</td></tr>))}</tbody></table></div>
                                <div className="grid grid-cols-2 gap-6 items-start">
                                    <div><label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label><textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-3 border rounded-lg"></textarea></div>
                                    <div className="space-y-3 pt-2"><div className="flex justify-between text-lg"><span className="text-gray-600">Subtotal:</span><span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span></div><div className="flex justify-between items-center text-lg"><span className="text-gray-600">Impuestos (%):</span><input type="number" value={taxRate * 100} onChange={e => setTaxRate(parseFloat(e.target.value) / 100 || 0)} className="w-20 p-1 border rounded-md text-right" /></div><div className="flex justify-between text-lg"><span className="text-gray-600">Monto Impuestos:</span><span className="font-semibold text-gray-800">{formatCurrency(taxAmount)}</span></div><div className="flex justify-between text-2xl font-bold pt-2 border-t mt-2"><span className="text-gray-800">Total:</span><span className="text-emerald-600">{formatCurrency(total)}</span></div></div>
                                </div>
                                </>
                            ) : (<p className="text-center text-gray-500 py-8">No se encontraron items facturables para el período seleccionado.</p>)}
                        </div>
                    )}
                </main>
                <footer className="px-6 sm:px-8 py-4 bg-gray-50 border-t flex justify-between items-center">
                    <button type="button" onClick={() => { setIsPreviewing(false); setLineItems([]); }} className={`${!isPreviewing ? 'invisible' : ''} px-6 py-2.5 font-semibold bg-gray-200 rounded-lg`}>Editar</button>
                    <div className="flex gap-4">
                        <button type="button" onClick={handleClose} className="px-8 py-3 font-semibold bg-gray-200 rounded-lg">Cancelar</button>
                        <button type="button" onClick={handleGenerate} disabled={!isPreviewing || lineItems.length === 0} className="px-8 py-3 font-semibold text-white bg-emerald-600 rounded-lg disabled:bg-gray-400">Generar Factura</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
