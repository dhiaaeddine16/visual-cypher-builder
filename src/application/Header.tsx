import { NewspaperIconOutline, QuestionMarkCircleIconOutline } from '@neo4j-ndl/react/icons';
import { Typography, IconButton, Tabs, Logo, Tooltip } from '@neo4j-ndl/react';
import ConnectButton from '../connection/ConnectionButton';

/**
 * Renders the application header with navigation and connection options.
 *
 * @param {string} title - The title to display in the header.
 * @param {string[]} [navItems=[]] - An array of navigation item labels.
 * @param {string} [activeNavItem=navItems[0]] - The currently active navigation item.
 * @param {(activeNavItem: string) => void} [setActiveNavItem=() => {}] - Callback to set the active navigation item.
 * @param {boolean} [useNeo4jConnect=false] - Flag to determine if Neo4j connection button should be rendered.
 * @param {any} connection - The current connection object.
 * @param {boolean} [connected=false] - Connection status flag.
 * @param {(connected: boolean) => void} [setConnected=() => {}] - Callback to set connection status.
 * @param {() => void} [openConnectionModal=() => {}] - Callback to open the connection modal.
 * @param {boolean} [userHeader=true] - Flag to determine if user-specific header options should be shown.
 * @param {() => void} [onHelpClick=() => {}] - Callback for help button click.
 * 
 * @returns {JSX.Element} The rendered header component.
 */
export default function Header({
  title,
  navItems = [],
  activeNavItem = navItems[0],
  setActiveNavItem = () => { },
  useNeo4jConnect = false,
  connected = false,
  connection = {},
  setConnected = () => { },
  openConnectionModal = () => { },
  userHeader = true,
  onHelpClick = () => { },
}: {
  title: string;
  navItems?: string[];
  activeNavItem?: string;
  setActiveNavItem?: (activeNavItem: string) => void;
  useNeo4jConnect?: boolean;
  connection: any;
  connected?: boolean;
  setConnected?: (connected: boolean) => void;
  openConnectionModal?: () => void;
  userHeader?: boolean;
  onHelpClick?: () => void;
}) {

  return (
    <div className='n-bg-palette-neutral-bg-weak p-1 border-b-2 border-[rgb(var(--theme-palette-neutral-border-weak))] h-16'>
      <nav
        className='flex items-center justify-between'
        role='navigation'
        data-testid='navigation'
        id='navigation'
        aria-label='main navigation'
      >
        <section className='flex md:flex-row flex-col items-center w-1/4 shrink-0 grow-0'>
          <div className='md:inline-block'>
            <Logo className='h-6 min-h-6 min-w-12 md:h-8 md:min-h-12 md:min-w-24 md:mr-2 mx-4' type='full' />
          </div>
          <div className='flex justify-center md:ml-0 pl-0'>
            <Typography className='md:inline-block hidden' variant='h6'>
              {title}
            </Typography>
            <Typography className='md:hidden inline-block' variant='subheading-small'>
              {title}
            </Typography>
          </div>
        </section>

        <section className='flex w-1/3 shrink-0 grow-0 justify-center items-center mb-[-26px]'>
          <Tabs size='large' fill='underline' onChange={(e) => setActiveNavItem(e)} value={activeNavItem}>
            {navItems.map((item) => (
              <Tabs.Tab tabId={item} key={item}>
                {item}
              </Tabs.Tab>
            ))}
          </Tabs>
        </section>
        <section className='flex items-center justify-end w-1/6 grow-0'>
          <div>
            <div className='flex grow-0 gap-x-1 w-max items-center pr-3'>

              <Tooltip type="simple">
                <Tooltip.Trigger>
                  <IconButton className='hidden md:inline-flex' ariaLabel='Help' size='large' onClick={onHelpClick}>
                    <QuestionMarkCircleIconOutline aria-label='Help' />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Content>Help</Tooltip.Content>
              </Tooltip>
              <Tooltip type="simple">
                <Tooltip.Trigger>
                  <IconButton className='hidden md:inline-flex' ariaLabel='Help' size='large' onClick={() => {
                    window.open('https://neo4j.com/docs/cypher-cheat-sheet/5/all/', '_blank');
                  }}  >
                    <NewspaperIconOutline aria-label='Help' />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Content>Cypher Guide</Tooltip.Content>
              </Tooltip>


              {userHeader ? (
                <div className='hidden md:inline-block'>
                  <ConnectButton uri={connection?.uri} connected={connected} onClick={() => {
                    setConnected(false);
                    openConnectionModal();
                  }} />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </nav>
    </div>
  );
}