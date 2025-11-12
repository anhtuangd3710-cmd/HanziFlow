
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { exportAllUsers } from '../../services/api';
import Spinner from '../Spinner';
import { DownloadIcon } from '../icons/DownloadIcon';
import { HelpCircleIcon } from '../icons/HelpCircleIcon';

const DataExport: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async (format: 'json' | 'excel') => {
        setIsLoading(true);
        setError(null);
        try {
            const users = await exportAllUsers();
            
            if (format === 'json') {
                const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(users, null, 2))}`;
                const link = document.createElement("a");
                link.href = jsonString;
                link.download = "hanziflow_users_export.json";
                link.click();
            } else if (format === 'excel') {
                 const worksheet = XLSX.utils.json_to_sheet(users);
                 const workbook = XLSX.utils.book_new();
                 XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                 XLSX.writeFile(workbook, "hanziflow_users_export.xlsx");
            }

        } catch (err) {
            setError('Failed to export data. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Export & Backup</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700">User Data Export</h2>
                <p className="text-gray-600 mt-2 mb-6">
                    Download a complete copy of all user data. This is useful for backups, migrations, or external analysis.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => handleExport('json')}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md disabled:bg-blue-300 transition-colors"
                    >
                        {isLoading ? <Spinner /> : <><DownloadIcon size={20} /> Export as JSON</>}
                    </button>
                    <button 
                        onClick={() => handleExport('excel')}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md disabled:bg-green-300 transition-colors"
                    >
                        {isLoading ? <Spinner /> : <><DownloadIcon size={20} /> Export as Excel</>}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>

            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <HelpCircleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3 space-y-2">
                         <h3 className="text-sm font-bold text-yellow-800">About Export Formats</h3>
                        <p className="text-sm text-yellow-700">
                            <strong className="font-semibold">JSON (Recommended for Backup):</strong> This format contains the complete, raw data structure from the database. It's the best option for creating a full backup that can be restored or migrated to another MongoDB database.
                        </p>
                         <p className="text-sm text-yellow-700">
                            <strong className="font-semibold">Excel:</strong> This format is best for viewing, sorting, and analyzing user data in spreadsheet software.
                        </p>
                        <p className="text-sm text-yellow-700">
                            <strong className="font-semibold">SQL Export:</strong> A direct SQL export is not provided because this application uses a NoSQL (MongoDB) database. Converting NoSQL documents to a relational SQL format is a complex process that requires a custom script and a predefined SQL schema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataExport;
