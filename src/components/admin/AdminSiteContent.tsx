import { useState } from 'react';
import { Home, Info, CalendarDays, Briefcase } from 'lucide-react';
import AdminHomeContent from './AdminHomeContent';
import AdminAboutEditor from './AdminAboutEditor';
import AdminBookEditor from './AdminBookEditor';
import AdminEventsEditor from './AdminEventsEditor';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, component: AdminHomeContent },
    { id: 'about', label: 'About', icon: Info, component: AdminAboutEditor },
    { id: 'book', label: 'Book Now', icon: Briefcase, component: AdminBookEditor },
    { id: 'events', label: 'Events', icon: CalendarDays, component: AdminEventsEditor },
];

const AdminSiteContent = () => {
    const [activeTab, setActiveTab] = useState('home');
    const active = TABS.find(t => t.id === activeTab) || TABS[0];
    const ActiveComponent = active.component;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Site Content</h2>
                <p className="text-muted-foreground">Manage content for every page on your site.</p>
            </div>

            {/* Sub-tabs */}
            <div
                className="flex gap-1 p-1 rounded-lg overflow-x-auto"
                style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
            >
                {TABS.map(tab => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 flex-1 justify-center whitespace-nowrap min-w-0"
                            style={{
                                backgroundColor: isActive ? '#d4af37' : 'transparent',
                                color: isActive ? '#000000' : '#888888',
                                fontWeight: isActive ? 700 : 500,
                            }}
                        >
                            <tab.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Active sub-tab content */}
            <ActiveComponent />
        </div>
    );
};

export default AdminSiteContent;
