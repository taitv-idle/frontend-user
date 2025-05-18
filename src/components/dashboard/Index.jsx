import React from 'react';
import Profile from './Profile';
import Addresses from './Addresses';

const Index = () => {
    return (
        <div className="space-y-8">
            <Profile />
            <Addresses />
        </div>
    );
};

export default Index;