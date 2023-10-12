import { FC, useContext, useEffect, useReducer, useRef } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { getSettings, saveSettings } from '@/utils/app/settings';

import { Settings } from '@/types/settings';

import HomeContext from '@/pages/api/home/home.context';

import { useRouter } from 'next/router';


export const SettingDialog: FC = () => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const router = useRouter();

  // const modalRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    homeDispatch({ field: 'lightMode', value: state.theme });
    saveSettings(state);
  };

  const goAdmin = () => {
    router.push('/admin')
  }

  // Render the dialog.
  return (
    <div className="flex flex-col justify-center">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="text-lg pt-8 pb-4 font-bold text-black dark:text-neutral-200">
          {t('Settings')}
        </div>
        <div
          className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
          role="dialog"
        >

          <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
            {t('Theme')}
          </div>

          <select
            className="w-full cursor-pointer bg-transparent p-2 text-neutral-700 dark:text-neutral-200"
            value={state.theme}
            onChange={(event) =>
              dispatch({ field: 'theme', value: event.target.value })
            }
          >
            <option value="dark">{t('Dark mode')}</option>
            <option value="light">{t('Light mode')}</option>
          </select>

          <button
            type="button"
            className="w-full px-4 py-2 mt-6 border cursor-pointer rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
            onClick={() => {
              handleSave();
            }}
          >
            {t('Save')}
          </button>
        </div>
        <div
          className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto border-none bg-white px-4 pt-5 pb-4 text-left align-bottom transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
          role="dialog"
        >
          <button
            type="button"
            className="w-full px-4 py-2 mt-6 border cursor-pointer rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
            onClick={() => {
              goAdmin();
            }}
          >
            管理后台
          </button>
        </div>
      </div>
    </div>
  );
};

{/* Dialog
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
 <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
           
          </div>
        </div>
      </div> 
      </div> */}