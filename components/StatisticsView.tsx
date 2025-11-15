import React, { useMemo } from 'react';
import type { SceneData } from '../types';

interface StatisticsViewProps {
  data: SceneData[];
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
    <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-card flex items-start gap-4">
        <div className="bg-primary-light dark:bg-dark-primary-light p-2 rounded-full text-primary dark:text-dark-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{label}</p>
            <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{value}</p>
        </div>
    </div>
);

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
    total: number;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, total }) => (
    <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-card">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{title}</h3>
        <div className="mt-4 space-y-3">
            {data.map(({ label, value }) => (
                <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-text-primary dark:text-dark-text-primary">{label}</span>
                        <span className="text-text-secondary dark:text-dark-text-secondary">{value} сцен</span>
                    </div>
                    <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-2">
                        <div 
                            className="bg-primary dark:bg-dark-primary h-2 rounded-full" 
                            style={{ width: `${(value / total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const StatisticsView: React.FC<StatisticsViewProps> = ({ data }) => {
    const stats = useMemo(() => {
        const locations = new Set(data.map(s => s.location));
        const characters = new Set(data.flatMap(s => s.characters));
        const dayScenes = data.filter(s => s.timeOfDay === 'День' || s.timeOfDay === 'Утро').length;
        const nightScenes = data.filter(s => s.timeOfDay === 'Вечер' || s.timeOfDay === 'Ночь').length;

        const locationCounts = data.reduce((acc, scene) => {
            acc[scene.location] = (acc[scene.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const characterCounts = data.reduce((acc, scene) => {
            scene.characters.forEach(char => {
                acc[char] = (acc[char] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);

        const sortedLocations = Object.entries(locationCounts).sort(([,a], [,b]) => b - a).map(([label, value]) => ({ label, value }));
        const sortedCharacters = Object.entries(characterCounts).sort(([,a], [,b]) => b - a).map(([label, value]) => ({ label, value }));
        
        return {
            totalScenes: data.length,
            locationsCount: locations.size,
            charactersCount: characters.size,
            dayNight: `${dayScenes} / ${nightScenes}`,
            locationDistribution: sortedLocations,
            characterDistribution: sortedCharacters,
        };
    }, [data]);

    const ICONS = {
        scenes: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>,
        locations: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
        characters: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        time: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    };

    const maxLocationCount = Math.max(...stats.locationDistribution.map(item => item.value), 1);
    const maxCharacterCount = Math.max(...stats.characterDistribution.map(item => item.value), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={ICONS.scenes} label="Всего сцен" value={stats.totalScenes} />
                <StatCard icon={ICONS.locations} label="Локаций" value={stats.locationsCount} />
                <StatCard icon={ICONS.characters} label="Персонажей" value={stats.charactersCount} />
                <StatCard icon={ICONS.time} label="День / Ночь" value={stats.dayNight} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Распределение по локациям" data={stats.locationDistribution} total={maxLocationCount} />
                <BarChart title="Главные персонажи" data={stats.characterDistribution} total={maxCharacterCount} />
            </div>
        </div>
    );
};

export default StatisticsView;
