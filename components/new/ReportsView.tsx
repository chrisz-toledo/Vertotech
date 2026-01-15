
import React, { useState } from 'react';
import { PayrollReport } from './PayrollReport';
import ClientProfitabilityReport from './ClientProfitabilityReport';
import JobsiteFinancialsReport from './JobsiteFinancialsReport';
import ForemanScorecardReport from './ForemanScorecardReport';
import { DocumentReportIcon } from '../icons/new/DocumentReportIcon';
import { TrendingUpIcon } from '../icons/new/TrendingUpIcon';
import { BriefcaseIcon } from '../icons/new/BriefcaseIcon';
import { useTranslation } from '../../hooks/useTranslation';
import { UsersGroupIcon } from '../icons/UsersGroupIcon';

type ReportTab = 'payroll' | 'clientProfitability' | 'jobsiteFinancials' | 'foremanPerformance';

const ReportsView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<ReportTab>('payroll');

    const TabButton: React.FC<{tab: ReportTab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button
          onClick={() => setActiveTab(tab)}
          className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 px-4 py-3 font-semibold rounded-t-lg border-b-2 transition-all duration-300 ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-blue-500 hover:bg-gray-200/50'}`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center -mb-px">
                    <TabButton tab="payroll" label={t('payrollReport')} icon={<DocumentReportIcon className="w-5 h-5"/>} />
                    <TabButton tab="clientProfitability" label={t('clientProfitability')} icon={<TrendingUpIcon className="w-5 h-5"/>} />
                    <TabButton tab="jobsiteFinancials" label={t('jobsiteFinancials')} icon={<BriefcaseIcon className="w-5 h-5"/>} />
                    <TabButton tab="foremanPerformance" label={t('foremanPerformance')} icon={<UsersGroupIcon className="w-5 h-5"/>} />
                </div>
            </div>
            
            <div>
                {activeTab === 'payroll' && <PayrollReport />}
                {activeTab === 'clientProfitability' && <ClientProfitabilityReport />}
                {activeTab === 'jobsiteFinancials' && <JobsiteFinancialsReport />}
                {activeTab === 'foremanPerformance' && <ForemanScorecardReport />}
            </div>
        </div>
    );
};

export default ReportsView;
