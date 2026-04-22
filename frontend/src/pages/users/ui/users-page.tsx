import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { useUsersDirectoryApi } from '@/features/users/api/use-users-directory-api';
import { normalizeUsersServiceError } from '@/shared/api/users-service-error';
import { DashboardField } from '@/shared/ui/dashboard-field';
import { DashboardNotice } from '@/shared/ui/dashboard-notice';
import { DashboardPanel } from '@/shared/ui/dashboard-panel';
import { DashboardUserAvatar } from '@/shared/ui/dashboard-user-avatar';

const USERS_DIRECTORY_PAGE_SIZE = 12;

type UsersDirectoryState =
  | { kind: 'loading' }
  | {
      kind: 'ready';
      users: Array<{
        id: string;
        username: string;
      }>;
      total: number;
    }
  | {
      kind: 'error';
      message: string;
    };

export function UsersPage() {
  const usersDirectoryApi = useUsersDirectoryApi();
  const [searchDraft, setSearchDraft] = useState('');
  const [activeUsernameFilter, setActiveUsernameFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<UsersDirectoryState>({ kind: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function loadUsersDirectory() {
      setIsLoading(true);

      try {
        const response = await usersDirectoryApi.getUsersDirectory({
          offset,
          limit: USERS_DIRECTORY_PAGE_SIZE,
          username: activeUsernameFilter,
        });

        if (!isMounted) {
          return;
        }

        setState({
          kind: 'ready',
          users: response.users.map((user) => ({
            id: user.id,
            username: user.username,
          })),
          total: response.total,
        });
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          kind: 'error',
          message: normalizeUsersServiceError(error).message,
        });
        setIsLoading(false);
      }
    }

    void loadUsersDirectory();

    return () => {
      isMounted = false;
    };
  }, [activeUsernameFilter, offset, retryNonce, usersDirectoryApi]);

  const totalUsers = state.kind === 'ready' ? state.total : 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_DIRECTORY_PAGE_SIZE));
  const currentPage = Math.floor(offset / USERS_DIRECTORY_PAGE_SIZE) + 1;
  const canGoToPreviousPage = offset > 0;
  const canGoToNextPage =
    state.kind === 'ready' && offset + USERS_DIRECTORY_PAGE_SIZE < state.total;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setActiveUsernameFilter(searchDraft.trim());
  }

  function handleResetFilter() {
    setSearchDraft('');
    setActiveUsernameFilter('');
    setOffset(0);
  }

  return (
    <section className="dashboard-page">
      <DashboardPanel className="users-directory">
        <form
          className="users-directory__toolbar"
          noValidate
          onSubmit={handleSearchSubmit}
        >
          <DashboardField
            inputProps={{
              autoComplete: 'off',
              placeholder: 'Search by username',
              type: 'text',
            }}
            label="Search"
            name="users-directory-search"
            onChange={(event) => setSearchDraft(event.target.value)}
            value={searchDraft}
          />
          <div className="users-directory__toolbar-actions">
            <button
              className="dashboard-primary-button"
              type="submit"
            >
              Search
            </button>
            <button
              className="dashboard-secondary-button"
              onClick={handleResetFilter}
              type="button"
            >
              Reset
            </button>
          </div>
        </form>

        {isLoading && state.kind !== 'ready' ? (
          <DashboardNotice
            description="Loading the next protected directory slice from users-service."
            title="Loading users"
            tone="info"
          />
        ) : null}

        {state.kind === 'error' ? (
          <DashboardNotice
            actions={(
              <button
                className="dashboard-secondary-button"
                onClick={() => setRetryNonce((value) => value + 1)}
                type="button"
              >
                Retry request
              </button>
            )}
            description={state.message}
            title="Users list is unavailable"
            tone="error"
          />
        ) : null}

        {state.kind === 'ready' && state.users.length === 0 ? (
          <DashboardNotice
            description={
              activeUsernameFilter
                ? `No users matched "${activeUsernameFilter}". Reset the filter to load the default paginated slice again.`
                : 'The users directory is empty right now.'
            }
            title="No users found"
            tone="info"
          />
        ) : null}

        {state.kind === 'ready' && state.users.length > 0 ? (
          <>
            <div className="users-directory__grid">
              {state.users.map((user) => (
                <article
                  className="users-directory-card"
                  key={user.id}
                >
                  <DashboardUserAvatar ariaLabel={`${user.username} avatar`} size="lg" />
                  <strong>{user.username}</strong>
                </article>
              ))}
            </div>

            <div className="users-directory__footer">
              <div className="users-directory__pagination">
                <button
                  className="dashboard-secondary-button"
                  disabled={!canGoToPreviousPage}
                  onClick={(event) => {
                    event.currentTarget.blur();
                    setOffset((currentOffset) =>
                      Math.max(0, currentOffset - USERS_DIRECTORY_PAGE_SIZE),
                    );
                  }}
                  type="button"
                >
                  Previous
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="dashboard-secondary-button"
                  disabled={!canGoToNextPage}
                  onClick={(event) => {
                    event.currentTarget.blur();
                    setOffset(
                      (currentOffset) => currentOffset + USERS_DIRECTORY_PAGE_SIZE,
                    );
                  }}
                  type="button"
                >
                  Next
                </button>
              </div>

              <Link
                className="dashboard-secondary-button"
                to={ROUTE_PATHS.profile}
              >
                Profile details
              </Link>
            </div>
          </>
        ) : null}
      </DashboardPanel>
    </section>
  );
}
