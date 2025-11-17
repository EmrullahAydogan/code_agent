import { Languages, Check } from 'lucide-react';
import { useI18n } from '../providers/I18nProvider';
import clsx from 'clsx';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'list';
  showLabel?: boolean;
}

export const LanguageSelector = ({
  variant = 'list',
  showLabel = true,
}: LanguageSelectorProps) => {
  const { language, setLanguage, availableLanguages } = useI18n();

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Languages className="w-4 h-4 inline mr-2" />
            Language
          </label>
        )}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Languages className="w-4 h-4 inline mr-2" />
          Language
        </label>
      )}
      <div className="space-y-2">
        {availableLanguages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={clsx(
              'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
              language === lang.code
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {lang.nativeName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {lang.name}
              </div>
            </div>
            {language === lang.code && (
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
