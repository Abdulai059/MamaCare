# MamaLink Documentation

This directory contains all documentation for the MamaLink mobile application project.

## Documentation Structure

### 🏗️ Architecture
- **STORAGE_ARCHITECTURE.md** - Overview of the data storage architecture and patterns

### 🔐 Authentication
- **AUTH_SETUP.md** - Authentication system setup guide
- **AUTH_FLOW_GUIDE.md** - Authentication flow documentation
- **AUTH_DEBUG_CHECKLIST.md** - Debugging checklist for authentication issues

### 📱 Offline Functionality
- **ASYNCSTORAGE_OFFLINE_SETUP.md** - AsyncStorage setup for offline data
- **OFFLINE_SETUP_PHASE1.md** - Phase 1 offline implementation
- **OFFLINE_INFRASTRUCTURE_COMPLETE.md** - Complete offline infrastructure
- **OFFLINE_FIRST_FIXES.md** - Fixes for offline-first functionality
- **OFFLINE_FIRST_UI_FIX.md** - UI fixes for offline experience
- **OFFLINE_VERIFICATION.md** - Verification of offline functionality
- **SIMPLIFIED_OFFLINE_READY.md** - Simplified offline-ready implementation
- **SYNC_ORDER_GUIDE.md** - Guide for data synchronization order

### 🔄 Refactoring
- **REFACTORING_COMPLETE.md** - Complete refactoring documentation (clean architecture implementation)

### 🚀 Implementation
- **Mamalink — Implementation Prompt Plan.md** - Overall implementation plan
- **docs_001.md** - Implementation documentation (part 1)
- **docs_002.md** - Implementation documentation (part 2)
- **PHASE3_IMPLEMENTATION_COMPLETE.md** - Phase 3 implementation completion
- **PHASE3_TESTING.md** - Phase 3 testing documentation
- **PROFILE_FIX_SUMMARY.md** - Profile-related fixes summary
- **MMKV_REBUILD_GUIDE.md** - MMKV storage rebuild guide

## Recent Changes

The most recent documentation includes the complete refactoring to clean architecture:

- Separated concerns into repositories, sync services, selectors, and enrichment
- Centralized initialization with explicit dependency ordering
- Fixed TypeScript errors and improved type safety
- Added proper `observer()` wrappers for Legend State components
- Enhanced offline-first functionality with better sync mechanisms

## Quick Links

- For **development setup**: See implementation docs
- For **offline functionality**: See offline folder
- For **authentication**: See auth folder
- For **architecture decisions**: See architecture folder
- For **recent refactoring**: See refactoring folder
