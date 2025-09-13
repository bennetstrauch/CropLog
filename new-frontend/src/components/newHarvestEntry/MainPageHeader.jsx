import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../reduxStore/Slices/AuthSlice';
import { Path_HarvestLog } from '../../routes/AppRouter';
import DateInputField from './DateInputField';

export default function MainPageHeader({
  visibility,
  showDateInputField,
  toggleDateInputField,
  goBack,
  harvestDate,
  setHarvestDate
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToHarvestLogPage = () => {
    navigate(Path_HarvestLog);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header>
      {visibility.afterCropSelection && (
        <button onClick={goBack}>
          ← Back
        </button>
      )}

      {visibility.beforeCropSelection && (
        <button onClick={goToHarvestLogPage}>
          Harvest Log
        </button>
      )}

      {visibility.beforeCropSelection && (
        <button onClick={toggleDateInputField}>
          {showDateInputField ? 'Hide Date Input' : 'Modify Date'}
        </button>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>

      {visibility.dateInputField && (
        <div>
          <DateInputField
            harvestDate={harvestDate}
            setHarvestDate={setHarvestDate}
          />
        </div>
      )}
    </header>
  );
}