import React, { useState, useEffect } from 'react';

const DonorTracker = () => {
    const [donors, setDonors] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ bloodType: '', radius: 50 });

    useEffect(() => {
        const savedDonors = JSON.parse(localStorage.getItem('donors')) || [];
        setDonors(savedDonors);
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const handleSearch = (userLat, userLng) => {
        setLoading(true);
        const results = donors
            .filter(d => d.blood_type === filter.bloodType)
            .map(d => ({
                ...d,
                distance: calculateDistance(userLat, userLng, d.latitude, d.longitude)
            }))
            .filter(d => d.distance <= filter.radius)
            .sort((a, b) => a.distance - b.distance);
        setSearchResult(results);
        setLoading(false);
    };

    return (
        <div className="react-donor-module p-6 bg-white rounded-xl shadow-lg" style={{ color: '#333' }}>
            <h2 className="text-2xl font-bold mb-4">React Donor Search</h2>
            <div className="results">
                {searchResult.length > 0 ? (
                    searchResult.map(donor => (
                        <div key={donor.id} className="p-4 border-b">
                            <h4 className="font-semibold">{donor.name}</h4>
                            <p className="text-sm font-bold text-red-600">Distance: {donor.distance.toFixed(2)} km</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Search to view donors.</p>
                )}
            </div>
        </div>
    );
};
export default DonorTracker;