// Infinity Housing App - Screen Organization
// This file provides organized exports for all screens in the application

// Authentication Screens
export * from './auth';

// Agent-specific Screens
export * from './agent';

// Tenant-specific Screens
export * from './tenant';

// Shared Screens (used by both agents and tenants)
export * from './shared';

// Screen Organization Summary:
//
// 📁 screens/
// ├── 📁 auth/           # Authentication & onboarding
// │   ├── LoginScreen
// │   ├── RegisterScreen
// │   ├── UserTypeScreen
// │   └── PreviewScreen
// │
// ├── 📁 agent/          # Agent/landlord specific screens
// │   ├── AgentHomeScreen
// │   ├── AddPropertyScreen
// │   ├── MyListingsScreen
// │   └── AgentAccountScreen
// │
// ├── 📁 tenant/         # Tenant/property seeker specific screens
// │   ├── TenantHomeScreen
// │   ├── HomeScreen
// │   ├── SavedItemsScreen
// │   └── ChatbotScreen
// │
// └── 📁 shared/         # Screens used by both user types
//     ├── PropertyDetailsScreen
//     ├── ProfileScreen
//     ├── EditProfileScreen
//     ├── ChangePasswordScreen
//     ├── SearchScreen
//     ├── NotificationsScreen
//     └── InquiriesScreen
//
// Benefits of this organization:
// - Clear separation of concerns
// - Easy to identify user-specific functionality
// - Simplified navigation management
// - Better code maintainability
// - Easier testing and debugging 