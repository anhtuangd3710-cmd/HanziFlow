
import React, { useState, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { User } from '@/lib/types';
import Spinner from './Spinner';

interface Props {
    currentUser: User;
    onClose: () => void;
}

const EditProfileModal: React.FC<Props> = ({ currentUser, onClose }) => {
    const context = useContext(AppContext);
    const [name, setName] = useState(currentUser.name);
    
    if (!context) return null;
    const { state, updateUserProfile } = context;

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Name cannot be empty.");
            return;
        }
        await updateUserProfile({ name: name.trim() });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <p className="mt-1 text-gray-500 bg-gray-100 p-2 rounded-md">{currentUser.email}</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={state.isLoading}
                        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-32 text-center disabled:bg-blue-400"
                    >
                        {state.isLoading ? <Spinner /> : 'Save Changes'}
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default EditProfileModal;
