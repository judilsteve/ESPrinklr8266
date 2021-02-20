import React, { useContext } from 'react';

import { Avatar, Badge } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, ListItemAvatar } from '@material-ui/core';

import WifiIcon from '@material-ui/icons/Wifi';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

import { isNetworkOpen, networkSecurityMode } from './WiFiSecurityModes';
import { WiFiNetwork, WiFiNetworkList } from './types';
import { WiFiConnectionContext } from './WiFiConnectionContext';

interface WiFiNetworkSelectorProps {
  networkList: WiFiNetworkList;
}

const WiFiNetworkSelector = (props: WiFiNetworkSelectorProps) => {

    const wifiContext = useContext(WiFiConnectionContext);

    const renderNetwork = (network: WiFiNetwork) => {
        return (
        <ListItem key={network.bssid} button onClick={() => wifiContext.selectNetwork(network)}>
            <ListItemAvatar>
            <Avatar>
                {isNetworkOpen(network) ? <LockOpenIcon /> : <LockIcon />}
            </Avatar>
            </ListItemAvatar>
            <ListItemText
            primary={network.ssid}
            secondary={"Security: " + networkSecurityMode(network) + ", Ch: " + network.channel}
            />
            <ListItemIcon>
            <Badge badgeContent={network.rssi + "db"}>
                <WifiIcon />
            </Badge>
            </ListItemIcon>
        </ListItem>
        );
    }

    return (
      <List>
        {props.networkList.networks.map(renderNetwork)}
      </List>
    );

}

export default WiFiNetworkSelector;
