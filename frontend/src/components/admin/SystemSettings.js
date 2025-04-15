// // src/components/admin/SystemSettings.js
// import React, { useState } from 'react';
// import './SystemSettings.css';

// const SystemSettings = () => {
//     const [settings, setSettings] = useState({
//         general: {
//             systemName: 'PetiGuard',
//             timeZone: 'Asia/Kolkata',
//             dateFormat: 'DD-MM-YYYY',
//             autoLogout: '30'
//         },
//         notifications: {
//             emailNotifications: true,
//             smsNotifications: true,
//             pushNotifications: false,
//             reminderFrequency: 'daily'
//         },
//         security: {
//             twoFactorAuth: true,
//             sessionTimeout: '30',
//             passwordExpiry: '90',
//             loginAttempts: '5'
//         },
//         ai: {
//             autoClassification: true,
//             sentimentAnalysis: true,
//             urgencyDetection: true,
//             duplicateDetection: true,
//             confidenceThreshold: '80'
//         }
//     });

//     const [activeTab, setActiveTab] = useState('general');
//     const [isSaving, setIsSaving] = useState(false);
//     const [saveSuccess, setSaveSuccess] = useState(false);

//     const handleTabChange = (tab) => {
//         setActiveTab(tab);
//     };

//     const handleSettingChange = (category, setting, value) => {
//         setSettings({
//             ...settings,
//             [category]: {
//                 ...settings[category],
//                 [setting]: value
//             }
//         });
//     };

//     const handleToggle = (category, setting) => {
//         setSettings({
//             ...settings,
//             [category]: {
//                 ...settings[category],
//                 [setting]: !settings[category][setting]
//             }
//         });
//     };

//     const handleSave = () => {
//         setIsSaving(true);

//         // Simulate saving to backend
//         setTimeout(() => {
//             setIsSaving(false);
//             setSaveSuccess(true);

//             // Hide success message after 3 seconds
//             setTimeout(() => {
//                 setSaveSuccess(false);
//             }, 3000);
//         }, 1000);
//     };

//     const handleReset = () => {
//         if (window.confirm('Are you sure you want to reset all settings to default values?')) {
//             // Reset to default values (this would come from your backend in a real app)
//             setSettings({
//                 general: {
//                     systemName: 'PetiGuard',
//                     timeZone: 'UTC',
//                     dateFormat: 'DD-MM-YYYY',
//                     autoLogout: '30'
//                 },
//                 notifications: {
//                     emailNotifications: true,
//                     smsNotifications: true,
//                     pushNotifications: false,
//                     reminderFrequency: 'daily'
//                 },
//                 security: {
//                     twoFactorAuth: true,
//                     sessionTimeout: '30',
//                     passwordExpiry: '90',
//                     loginAttempts: '5'
//                 },
//                 ai: {
//                     autoClassification: true,
//                     sentimentAnalysis: true,
//                     urgencyDetection: true,
//                     duplicateDetection: true,
//                     confidenceThreshold: '80'
//                 }
//             });
//         }
//     };

//     return (
//         <div className="system-settings-container">
//             <div className="page-header">
//                 <h2>System Settings</h2>
//                 <div className="actions">
//                     <button
//                         className="reset-btn"
//                         onClick={handleReset}
//                     >
//                         Reset to Default
//                     </button>
//                     <button
//                         className="save-btn"
//                         onClick={handleSave}
//                         disabled={isSaving}
//                     >
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </div>

//             {saveSuccess && (
//                 <div className="save-success">
//                     Settings have been saved successfully!
//                 </div>
//             )}

//             <div className="settings-container">
//                 <div className="settings-tabs">
//                     <button
//                         className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
//                         onClick={() => handleTabChange('general')}
//                     >
//                         General
//                     </button>
//                     <button
//                         className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
//                         onClick={() => handleTabChange('notifications')}
//                     >
//                         Notifications
//                     </button>
//                     <button
//                         className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
//                         onClick={() => handleTabChange('security')}
//                     >
//                         Security
//                     </button>
//                     <button
//                         className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
//                         onClick={() => handleTabChange('ai')}
//                     >
//                         AI Settings
//                     </button>
//                 </div>

//                 <div className="settings-content">
//                     {activeTab === 'general' && (
//                         <div className="settings-section">
//                             <h3>General Settings</h3>

//                             <div className="setting-item">
//                                 <label>System Name</label>
//                                 <input
//                                     type="text"
//                                     value={settings.general.systemName}
//                                     onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
//                                 />
//                             </div>

//                             <div className="setting-item">
//                                 <label>Time Zone</label>
//                                 <select
//                                     value={settings.general.timeZone}
//                                     onChange={(e) => handleSettingChange('general', 'timeZone', e.target.value)}
//                                 >
//                                     <option value="UTC">UTC</option>
//                                     <option value="Asia/Kolkata">Asia/Kolkata</option>
//                                     <option value="America/New_York">America/New_York</option>
//                                     <option value="Europe/London">Europe/London</option>
//                                     <option value="Australia/Sydney">Australia/Sydney</option>
//                                 </select>
//                             </div>

//                             <div className="setting-item">
//                                 <label>Date Format</label>
//                                 <select
//                                     value={settings.general.dateFormat}
//                                     onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
//                                 >
//                                     <option value="DD-MM-YYYY">DD-MM-YYYY</option>
//                                     <option value="MM-DD-YYYY">MM-DD-YYYY</option>
//                                     <option value="YYYY-MM-DD">YYYY-MM-DD</option>
//                                 </select>
//                             </div>

//                             <div className="setting-item">
//                                 <label>Auto Logout (minutes)</label>
//                                 <input
//                                     type="number"
//                                     value={settings.general.autoLogout}
//                                     min="5"
//                                     max="120"
//                                     onChange={(e) => handleSettingChange('general', 'autoLogout', e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'notifications' && (
//                         <div className="settings-section">
//                             <h3>Notification Settings</h3>

//                             <div className="setting-item toggle">
//                                 <label>Email Notifications</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="emailNotifications"
//                                         checked={settings.notifications.emailNotifications}
//                                         onChange={() => handleToggle('notifications', 'emailNotifications')}
//                                     />
//                                     <label htmlFor="emailNotifications"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item toggle">
//                                 <label>SMS Notifications</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="smsNotifications"
//                                         checked={settings.notifications.smsNotifications}
//                                         onChange={() => handleToggle('notifications', 'smsNotifications')}
//                                     />
//                                     <label htmlFor="smsNotifications"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item toggle">
//                                 <label>Push Notifications</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="pushNotifications"
//                                         checked={settings.notifications.pushNotifications}
//                                         onChange={() => handleToggle('notifications', 'pushNotifications')}
//                                     />
//                                     <label htmlFor="pushNotifications"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item">
//                                 <label>Reminder Frequency</label>
//                                 <select
//                                     value={settings.notifications.reminderFrequency}
//                                     onChange={(e) => handleSettingChange('notifications', 'reminderFrequency', e.target.value)}
//                                 >
//                                     <option value="hourly">Hourly</option>
//                                     <option value="daily">Daily</option>
//                                     <option value="weekly">Weekly</option>
//                                 </select>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'security' && (
//                         <div className="settings-section">
//                             <h3>Security Settings</h3>

//                             <div className="setting-item toggle">
//                                 <label>Two-factor Authentication</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="twoFactorAuth"
//                                         checked={settings.security.twoFactorAuth}
//                                         onChange={() => handleToggle('security', 'twoFactorAuth')}
//                                     />
//                                     <label htmlFor="twoFactorAuth"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item">
//                                 <label>Session Timeout (minutes)</label>
//                                 <input
//                                     type="number"
//                                     value={settings.security.sessionTimeout}
//                                     min="5"
//                                     max="120"
//                                     onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
//                                 />
//                             </div>

//                             <div className="setting-item">
//                                 <label>Password Expiry (days)</label>
//                                 <input
//                                     type="number"
//                                     value={settings.security.passwordExpiry}
//                                     min="30"
//                                     max="365"
//                                     onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
//                                 />
//                             </div>

//                             <div className="setting-item">
//                                 <label>Max Login Attempts</label>
//                                 <input
//                                     type="number"
//                                     value={settings.security.loginAttempts}
//                                     min="3"
//                                     max="10"
//                                     onChange={(e) => handleSettingChange('security', 'loginAttempts', e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'ai' && (
//                         <div className="settings-section">
//                             <h3>AI Settings</h3>

//                             <div className="setting-item toggle">
//                                 <label>Auto Classification</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="autoClassification"
//                                         checked={settings.ai.autoClassification}
//                                         onChange={() => handleToggle('ai', 'autoClassification')}
//                                     />
//                                     <label htmlFor="autoClassification"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item toggle">
//                                 <label>Sentiment Analysis</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="sentimentAnalysis"
//                                         checked={settings.ai.sentimentAnalysis}
//                                         onChange={() => handleToggle('ai', 'sentimentAnalysis')}
//                                     />
//                                     <label htmlFor="sentimentAnalysis"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item toggle">
//                                 <label>Urgency Detection</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="urgencyDetection"
//                                         checked={settings.ai.urgencyDetection}
//                                         onChange={() => handleToggle('ai', 'urgencyDetection')}
//                                     />
//                                     <label htmlFor="urgencyDetection"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item toggle">
//                                 <label>Duplicate Detection</label>
//                                 <div className="toggle-switch">
//                                     <input
//                                         type="checkbox"
//                                         id="duplicateDetection"
//                                         checked={settings.ai.duplicateDetection}
//                                         onChange={() => handleToggle('ai', 'duplicateDetection')}
//                                     />
//                                     <label htmlFor="duplicateDetection"></label>
//                                 </div>
//                             </div>

//                             <div className="setting-item">
//                                 <label>Confidence Threshold (%)</label>
//                                 <input
//                                     type="number"
//                                     value={settings.ai.confidenceThreshold}
//                                     min="50"
//                                     max="99"
//                                     onChange={(e) => handleSettingChange('ai', 'confidenceThreshold', e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SystemSettings;