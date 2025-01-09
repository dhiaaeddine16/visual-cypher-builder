import React, { useState } from 'react';
import { Menu, Typography, IconButton, Avatar } from '@neo4j-ndl/react';
import { ChevronDownIconOutline } from '@neo4j-ndl/react/icons';

const settings = ['Profile', 'Logout'];

/**
 * A button component that displays a menu with options to connect to a Neo4j database
 * when clicked.
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.connected=false] - Whether the user is connected to a database
 * @param {string} [props.uri=''] - The URI of the database the user is connected to
 * @param {Function} [props.onClick] - A callback function that is called when the button is clicked
 *
 * @returns {React.ReactElement} - The rendered ConnectButton component
 */
export default function ConnectButton({
  connected = false,
  uri = '',
  onClick = () => { },
}: {
  connected: boolean;
  uri: string;
  onClick?: () => void;
}) {
  const [anchorEl, ConnectionButton] = useState<HTMLElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    onClick();
  };
  const handleClose = () => {
    ConnectionButton(null);
  };

  const menuSelect = (e: string) => {
    window.alert(e);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <div
      className='hidden 
      md:flex md:p-1.5 md:gap-2 md:h-12 md:items-center md:inline-block 
      md:border md:border-[rgb(var(--theme-palette-neutral-border-strong))] md:rounded-xl'
    >
      {/* <Avatar className='md:flex hidden' name='JD' shape='square' size='large' type='letters' /> */}

      <div className='flex flex-col'>
        <Typography variant='body-medium' className='p-0.5'>
          {connected ? 'Connected ✅' : 'Not connected ⚠️'}

        </Typography>

        <Typography variant='body-small' className='p-0.5'>

          {connected ? uri : 'Connect to a database'}
        </Typography>
        {/* @ts-ignore */}
        <Menu className='mt-1.5 ml-4' anchorEl={anchorEl} open={open} onClose={handleClose}>
          <Menu.Items>
            {settings.map((setting) => (
              <Menu.Item key={setting} onClick={() => menuSelect(setting)} title={setting} />
            ))}
          </Menu.Items>
        </Menu>
      </div>
      <IconButton ariaLabel='settings' onClick={handleClick}
      // open={open}
      >
        <ChevronDownIconOutline />
      </IconButton>
    </div>
  );
}