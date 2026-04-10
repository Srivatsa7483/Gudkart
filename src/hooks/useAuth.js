/**
 * useAuth Hook
 *
 * Re-exports the useAuth hook from AuthContext.
 *
 * This allows screens to import from either path:
 *   import { useAuth } from '../../context/AuthContext';
 *   import { useAuth } from '../../hooks/useAuth';
 *
 * Both resolve to the same hook and same context.
 */
export { useAuth } from '../context/AuthContext';