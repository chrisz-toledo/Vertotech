import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePOSStore, findProductIdByBarcode } from '../../../hooks/stores/usePOSStore';
import type { POSProduct } from './posShared';
import { formatMoney } from './posShared';
import { SearchIcon } from '../../icons/SearchIcon';
import { StarIcon } from '../../icons/StarIcon';
import { PlusIcon } from '../../icons/new/PlusIcon';
import { TagIcon } from '../../icons/new/TagIcon';
import { PencilIcon } from '../../icons/PencilIcon';

interface Props {
    products: POSProduct[];
    onAdd: (p: POSProduct) => void;
}

const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export const ProductGrid: React.FC<Props> = ({ products, onAdd }) => {
    const { t } = useTranslation();
    const favorites = usePOSStore(s => s.favorites);
    const toggleFavorite = usePOSStore(s => s.toggleFavorite);
    const barcodes = usePOSStore(s => s.barcodes);
    const setBarcode = usePOSStore(s => s.setBarcode);
    const setPrice = usePOSStore(s => s.setPrice);

    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<'fav' | 'all'>('fav');
    const [scanCode, setScanCode] = useState('');
    const [scanMsg, setScanMsg] = useState<string | null>(null);
    const [editingBarcodeFor, setEditingBarcodeFor] = useState<string | null>(null);
    const [barcodeDraft, setBarcodeDraft] = useState('');
    const [editingPriceFor, setEditingPriceFor] = useState<string | null>(null);
    const [priceDraft, setPriceDraft] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = tab === 'fav' ? products.filter(p => favorites.includes(p.id)) : products;
        if (q) {
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (barcodes[p.id] ?? '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, favorites, tab, query, barcodes]);

    const handleScan = () => {
        const code = scanCode.trim();
        if (!code) return;
        const pid = findProductIdByBarcode(code);
        const product = products.find(p => p.id === pid);
        if (product) {
            onAdd(product);
            setScanMsg(t('posScanAdded' as any));
            setScanCode('');
        } else {
            setScanMsg(t('posScanNotFound' as any));
        }
        window.setTimeout(() => setScanMsg(null), 2500);
    };

    const openBarcodeEditor = (p: POSProduct) => {
        setEditingBarcodeFor(p.id);
        setBarcodeDraft(barcodes[p.id] ?? '');
        setEditingPriceFor(null);
    };

    const openPriceEditor = (p: POSProduct) => {
        setEditingPriceFor(p.id);
        setPriceDraft(String(p.price));
        setEditingBarcodeFor(null);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('posSearchProducts' as any)}
                        className={`${inputClass} pl-9`}
                    />
                </div>
                <div className="flex gap-1 flex-1">
                    <input
                        value={scanCode}
                        onChange={(e) => setScanCode(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
                        placeholder={t('posBarcode' as any)}
                        className={inputClass}
                    />
                    <button
                        onClick={handleScan}
                        className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0"
                    >
                        {t('posScan' as any)}
                    </button>
                </div>
            </div>
            {scanMsg && (
                <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">{scanMsg}</div>
            )}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => setTab('fav')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-full ${tab === 'fav' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    ★ {t('posFavorites' as any)}
                </button>
                <button
                    onClick={() => setTab('all')}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-full ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    {t('posAll' as any)}
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 content-start">
                {filtered.map(p => (
                    <div key={p.id} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col">
                        <button
                            onClick={() => toggleFavorite(p.id)}
                            title={t('posToggleFavorite' as any)}
                            className={`absolute top-2 right-2 p-1 rounded-full ${favorites.includes(p.id) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'}`}
                        >
                            <StarIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onAdd(p)} className="text-left flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white pr-6 line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {p.productType === 'material' ? t('posMaterial' as any) : t('posTool' as any)}
                                {' · '}{t('posStock' as any)}: {p.stock} {p.unit}
                            </div>
                            <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">{formatMoney(p.price)}</div>
                            {barcodes[p.id] && (
                                <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{barcodes[p.id]}</div>
                            )}
                        </button>
                        <div className="flex gap-1 mt-2">
                            <button
                                onClick={() => onAdd(p)}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                <PlusIcon className="w-4 h-4" /> {t('posAdd' as any)}
                            </button>
                            <button
                                onClick={() => openBarcodeEditor(p)}
                                title={t('posAssignBarcode' as any)}
                                className="p-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <TagIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => openPriceEditor(p)}
                                title={t('posSetPrice' as any)}
                                className="p-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {editingBarcodeFor === p.id && (
                            <div className="mt-2 flex gap-1">
                                <input
                                    value={barcodeDraft}
                                    onChange={(e) => setBarcodeDraft(e.target.value)}
                                    placeholder={t('posBarcode' as any)}
                                    className={`${inputClass} text-xs`}
                                    autoFocus
                                />
                                <button
                                    onClick={() => { setBarcode(p.id, barcodeDraft); setEditingBarcodeFor(null); }}
                                    className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        )}
                        {editingPriceFor === p.id && (
                            <div className="mt-2 flex gap-1">
                                <input
                                    type="number" min="0" step="0.01"
                                    value={priceDraft}
                                    onChange={(e) => setPriceDraft(e.target.value)}
                                    placeholder={t('posPrice' as any)}
                                    className={`${inputClass} text-xs`}
                                    autoFocus
                                />
                                <button
                                    onClick={() => { setPrice(p.id, parseFloat(priceDraft) || 0); setEditingPriceFor(null); }}
                                    className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-10">
                        {t('posNoProducts' as any)}
                    </div>
                )}
            </div>
        </div>
    );
};
