import React, { useState } from 'react';
import { Switch, RouteComponentProps, Redirect, Route } from 'react-router-dom';
import './assets/fonts/fonts.css';
import { Layout } from './components/UI/Layout/Layout';
import { Tag } from './containers/Tag/Tag';
import { TagPage } from './components/pages/TagPage/TagPage';
import { Registration } from './containers/Auth/Registration/Registration';
import { ConfirmOTP } from './containers/Auth/ConfirmOTP/ConfirmOTP';
import { Login } from './containers/Auth/Login/Login';
import { SpeedSendPage } from './components/pages/Template/SpeedSendPage/SpeedSendPage';
import { SpeedSend } from './containers/Template/SpeedSend/SpeedSend';
import { HSMPage } from './components/pages/Template/HSMPage/HSMPage';
import { HSM } from './containers/Template/HSM/HSM';
import { Chat } from './containers/Chat/Chat';
import styles from './App.module.css';
import gqlClient from './config/apolloclient';
import { ApolloProvider } from '@apollo/client';
import { SessionContext } from './context/session';
import { AutomationList } from './containers/Automation/AutomationList/AutomationList';
import { Automation } from './containers/Automation/Automation';
import { FlowEditor } from './components/floweditor/FlowEditor';
import { ErrorHandler } from './containers/ErrorHandler/ErrorHandler';

const App = () => {
  const session = localStorage.getItem('session');
  const [authenticated, setAuthenticated] = useState(session ? true : false);

  const values = {
    authenticated: authenticated,
    setAuthenticated: (value: any) => {
      setAuthenticated(value);
    },
  };

  const accessToken = session ? JSON.parse(session).access_token : null;
  const defaultRedirect = () => <Redirect to="/chat" />;
  const client = authenticated ? gqlClient(accessToken) : gqlClient(null);
  let routes;

  if (authenticated) {
    routes = (
      <div className={styles.App}>
        <Layout>
          <Switch>
            <Route path="/tag" exact component={TagPage} />
            <Route path="/tag/add" exact component={Tag} />
            <Route path="/tag/:id/edit" exact component={Tag} />
            <Route path="/speed-send" exact component={SpeedSendPage} />
            <Route path="/speed-send/add" exact component={SpeedSend} />
            <Route path="/speed-send/:id/edit" exact component={SpeedSend} />
            <Route path="/automation" exact component={AutomationList} />
            <Route path="/automation/add" exact component={Automation} />
            <Route path="/automation/:id/edit" exact component={Automation} />
            <Route path="/automation/configure/:uuid" exact component={FlowEditor} />

            <Route path="/chat" exact component={Chat} />
            <Route path="/template" exact component={HSMPage} />
            <Route path="/template/add" exact component={HSM} />
            <Route path="/template/:id/edit" exact component={HSM} />

            <Route
              exact
              path="/chat/:contactId"
              component={({ match }: RouteComponentProps<{ contactId: any }>) => (
                <Chat contactId={match.params.contactId} />
              )}
            />
            <Route path="/" render={defaultRedirect} />
          </Switch>
        </Layout>
      </div>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/registration" exact component={Registration} />
        <Route path="/confirmotp" exact component={ConfirmOTP} />
        <Route path="/" render={() => <Redirect to="/login" />} />
      </Switch>
    );
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={client}>
        <ErrorHandler />
        {routes}
      </ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
