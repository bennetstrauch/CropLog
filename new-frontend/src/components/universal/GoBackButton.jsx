import React from 'react'
import { useNavigate } from 'react-router-dom';

const GoBackButton = ({ toMainPage = false, minimal = false }) => {

    const navigate = useNavigate();

    const goBack = () => {
        if (toMainPage) {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    if (minimal) {
        return (
            <button
                onClick={goBack}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                title="Back"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        );
    }

    return (
        <button onClick={goBack}>
            ← Back
        </button>
    )
}

export default GoBackButton