import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/auth-provider";
import { AnnouncementProvider } from "./hooks/announcement-provider";

import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import DepositPage from "./pages/deposit";
import WithdrawPage from "./pages/withdraw";
import YoutubeVerification from "./pages/youtube-verification";
import ReferralsPage from "./pages/referrals";
import StatisticsPage from "./pages/statistics";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import NotFound from "./pages/not-found";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminUsers from "./pages/admin/users";
import AdminDeposits from "./pages/admin/deposits";
import AdminWithdrawals from "./pages/admin/withdrawals";
import AdminAnnouncements from "./pages/admin/announcements";

function App() {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Admin Routes */}
          <Route path="/admin">
            <Layout isAdmin>
              <Switch>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/deposits" component={AdminDeposits} />
                <Route path="/admin/withdrawals" component={AdminWithdrawals} />
                <Route path="/admin/announcements" component={AdminAnnouncements} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </Route>
          
          {/* User Routes */}
          <Route path="/">
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/deposit" component={DepositPage} />
                <Route path="/withdraw" component={WithdrawPage} />
                <Route path="/youtube" component={YoutubeVerification} />
                <Route path="/referrals" component={ReferralsPage} />
                <Route path="/statistics" component={StatisticsPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </Route>
        </Switch>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

export default App;