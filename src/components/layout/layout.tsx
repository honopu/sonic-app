import {
  chakra,
  Container,
  Grid,
  GridItem,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { usePlugStore } from '@/store';

import { PlugButton } from '..';
import { LogoBox } from '../core';
import { PlugPrincipalIDMenu } from '../plug/plug-principal-id-tag';
import {
  FOOTER_HEIGHT,
  NAVBAR_HEIGHT,
  NAVIGATION_TABS,
} from './layout.constants';

export const Layout: React.FC = ({ children, ...props }) => {
  const { isConnected } = usePlugStore();
  const location = useLocation();

  const currentTabIndex = useMemo(
    () =>
      NAVIGATION_TABS.findIndex(({ url }) => location.pathname.includes(url)),
    [location]
  );

  return (
    <>
      <Container maxW="container.xl">
        <Grid
          as="header"
          py="8"
          templateColumns="repeat(5, 1fr)"
          gap="4"
          alignItems="center"
        >
          <GridItem colSpan={1} justifySelf="center" alignItems="center">
            <LogoBox />
          </GridItem>
          <GridItem colSpan={3} justifySelf="center">
            <chakra.nav>
              <Tabs
                index={currentTabIndex}
                variant="solid-rounded"
                colorScheme="dark-blue"
              >
                <TabList>
                  {NAVIGATION_TABS.map(({ label, url }) => (
                    <Tab
                      as={Link}
                      key={label}
                      isSelected={location.pathname === url}
                      to={url}
                    >
                      {label}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </chakra.nav>
          </GridItem>
          <GridItem colSpan={1} justifySelf="center">
            {isConnected ? <PlugPrincipalIDMenu /> : <PlugButton />}
          </GridItem>
        </Grid>
      </Container>

      <Container
        as="main"
        maxW="xl"
        h={`calc(100vh - ${NAVBAR_HEIGHT} - ${FOOTER_HEIGHT})`}
        maxH={`calc(100vh - ${NAVBAR_HEIGHT} - ${FOOTER_HEIGHT})`}
        py="10"
        display="flex"
        flexDirection="column"
        {...props}
      >
        {children}
      </Container>

      <chakra.footer px="4" py="2">
        <Text>Sonic v1</Text>
      </chakra.footer>
    </>
  );
};
