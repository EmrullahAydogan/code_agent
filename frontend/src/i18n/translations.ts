export const translations = {
  en: {
    // Navigation
    'nav.agents': 'Agents',
    'nav.projects': 'Projects',
    'nav.templates': 'Templates',
    'nav.workflows': 'Workflows',
    'nav.codeReviews': 'Code Reviews',
    'nav.testing': 'Testing',
    'nav.knowledge': 'Knowledge Base',
    'nav.plugins': 'Plugins',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.close': 'Close',

    // Agents
    'agents.title': 'AI Agents',
    'agents.create': 'Create Agent',
    'agents.provider': 'Provider',
    'agents.model': 'Model',
    'agents.systemPrompt': 'System Prompt',
    'agents.temperature': 'Temperature',
    'agents.active': 'Active',
    'agents.inactive': 'Inactive',
    'agents.noAgents': 'No agents found',
    'agents.createFirst': 'Create your first agent to get started',

    // Projects
    'projects.title': 'Projects',
    'projects.create': 'Create Project',
    'projects.path': 'Path',
    'projects.language': 'Language',
    'projects.noProjects': 'No projects found',

    // Tasks
    'tasks.title': 'Tasks',
    'tasks.create': 'Create Task',
    'tasks.pending': 'Pending',
    'tasks.running': 'Running',
    'tasks.completed': 'Completed',
    'tasks.failed': 'Failed',
    'tasks.cancelled': 'Cancelled',

    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',

    // Notifications
    'notification.agentCreated': 'Agent created successfully',
    'notification.agentUpdated': 'Agent updated successfully',
    'notification.agentDeleted': 'Agent deleted successfully',
    'notification.projectCreated': 'Project created successfully',
    'notification.taskCreated': 'Task created successfully',
  },

  tr: {
    // Navigation
    'nav.agents': 'Ajanlar',
    'nav.projects': 'Projeler',
    'nav.templates': 'Şablonlar',
    'nav.workflows': 'İş Akışları',
    'nav.codeReviews': 'Kod İncelemeleri',
    'nav.testing': 'Test',
    'nav.knowledge': 'Bilgi Tabanı',
    'nav.plugins': 'Eklentiler',
    'nav.analytics': 'Analitik',
    'nav.settings': 'Ayarlar',

    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.create': 'Oluştur',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.confirm': 'Onayla',
    'common.name': 'İsim',
    'common.description': 'Açıklama',
    'common.status': 'Durum',
    'common.actions': 'İşlemler',
    'common.close': 'Kapat',

    // Agents
    'agents.title': 'Yapay Zeka Ajanları',
    'agents.create': 'Ajan Oluştur',
    'agents.provider': 'Sağlayıcı',
    'agents.model': 'Model',
    'agents.systemPrompt': 'Sistem Promptu',
    'agents.temperature': 'Sıcaklık',
    'agents.active': 'Aktif',
    'agents.inactive': 'Pasif',
    'agents.noAgents': 'Ajan bulunamadı',
    'agents.createFirst': 'Başlamak için ilk ajanınızı oluşturun',

    // Projects
    'projects.title': 'Projeler',
    'projects.create': 'Proje Oluştur',
    'projects.path': 'Yol',
    'projects.language': 'Dil',
    'projects.noProjects': 'Proje bulunamadı',

    // Tasks
    'tasks.title': 'Görevler',
    'tasks.create': 'Görev Oluştur',
    'tasks.pending': 'Beklemede',
    'tasks.running': 'Çalışıyor',
    'tasks.completed': 'Tamamlandı',
    'tasks.failed': 'Başarısız',
    'tasks.cancelled': 'İptal Edildi',

    // Settings
    'settings.title': 'Ayarlar',
    'settings.general': 'Genel',
    'settings.appearance': 'Görünüm',
    'settings.language': 'Dil',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Açık',
    'settings.theme.dark': 'Koyu',
    'settings.theme.system': 'Sistem',

    // Notifications
    'notification.agentCreated': 'Ajan başarıyla oluşturuldu',
    'notification.agentUpdated': 'Ajan başarıyla güncellendi',
    'notification.agentDeleted': 'Ajan başarıyla silindi',
    'notification.projectCreated': 'Proje başarıyla oluşturuldu',
    'notification.taskCreated': 'Görev başarıyla oluşturuldu',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
