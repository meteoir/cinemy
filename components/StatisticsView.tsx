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
        <div className="bg-primary-light dark:bg-dark-primary-light p-3 rounded-full text-primary dark:text-dark-primary">
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
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const max = useMemo(() => Math.max(...data.map(item => item.value), 0), [data]);

    return (
        <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{title}</h3>
            <div className="mt-4 space-y-3">
                {data.slice(0, 7).map(({ label, value }) => (
                    <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-text-primary dark:text-dark-text-primary truncate" title={label}>{label}</span>
                            <span className="text-text-secondary dark:text-dark-text-secondary">{value} сцен</span>
                        </div>
                        <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-2">
                            <div 
                                className="bg-primary dark:bg-dark-primary h-2 rounded-full" 
                                style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ data }) => {
    const stats = useMemo(() => {
        const locations = new Set(data.map(s => s.location));
        const characters = new Set(data.flatMap(s => s.characters));
        const dayScenes = data.filter(s => s.timeOfDay.toLowerCase() === 'день' || s.timeOfDay.toLowerCase() === 'утро').length;
        const nightScenes = data.filter(s => s.timeOfDay.toLowerCase() === 'вечер' || s.timeOfDay.toLowerCase() === 'ночь').length;

        // FIX: Explicitly type the accumulator for the reduce function to ensure correct type inference.
        const locationCounts = data.reduce<Record<string, number>>((acc, scene) => {
            acc[scene.location] = (acc[scene.location] || 0) + 1;
            return acc;
        }, {});

        // FIX: Explicitly type the accumulator for the reduce function to ensure correct type inference.
        const characterCounts = data.reduce<Record<string, number>>((acc, scene) => {
            scene.characters.forEach(char => {
                acc[char] = (acc[char] || 0) + 1;
            });
            return acc;
        }, {});

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
        scenes: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125a1.125 1.125 0 00-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>,
        locations: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
        characters: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
        time: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={ICONS.scenes} label="Всего сцен" value={stats.totalScenes} />
                <StatCard icon={ICONS.locations} label="Локаций" value={stats.locationsCount} />
                <StatCard icon={ICONS.characters} label="Персонажей" value={stats.charactersCount} />
                <StatCard icon={ICONS.time} label="День / Ночь" value={stats.dayNight} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Распределение по локациям" data={stats.locationDistribution} />
                <BarChart title="Главные персонажи" data={stats.characterDistribution} />
            </div>
        </div>
    );
};

export default StatisticsView;