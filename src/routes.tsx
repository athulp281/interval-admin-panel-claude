import { createBrowserRouter } from "react-router";
import AdminLayout from "@/layouts/AdminLayout";
import FullWidthLayout from "@/layouts/FullWidthLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Admin pages
import Ecommerce from "@/app/(admin)/page";
import Analytics from "@/app/(admin)/(home)/analytics/page";
import Crm from "@/app/(admin)/(home)/crm/page";
import Logistics from "@/app/(admin)/(home)/logistics/page";
import Marketing from "@/app/(admin)/(home)/marketing/page";
import Saas from "@/app/(admin)/(home)/saas/page";
import Stocks from "@/app/(admin)/(home)/stocks/page";

// AI
import CodeGenerator from "@/app/(admin)/(others-pages)/(ai)/code-generator/page";
import ImageGenerator from "@/app/(admin)/(others-pages)/(ai)/image-generator/page";
import TextGenerator from "@/app/(admin)/(others-pages)/(ai)/text-generator/page";
import VideoGenerator from "@/app/(admin)/(others-pages)/(ai)/video-generator/page";

// Charts
import BarChart from "@/app/(admin)/(others-pages)/(chart)/bar-chart/page";
import LineChart from "@/app/(admin)/(others-pages)/(chart)/line-chart/page";
import PieChart from "@/app/(admin)/(others-pages)/(chart)/pie-chart/page";

// Ecommerce subpages
import AddProduct from "@/app/(admin)/(others-pages)/(ecommerce)/add-product/page";
import Billing from "@/app/(admin)/(others-pages)/(ecommerce)/billing/page";
import CreateInvoice from "@/app/(admin)/(others-pages)/(ecommerce)/create-invoice/page";
import Invoices from "@/app/(admin)/(others-pages)/(ecommerce)/invoices/page";
import ProductsList from "@/app/(admin)/(others-pages)/(ecommerce)/products-list/page";
import SingleInvoice from "@/app/(admin)/(others-pages)/(ecommerce)/single-invoice/page";
import SingleTransaction from "@/app/(admin)/(others-pages)/(ecommerce)/single-transaction/page";
import Transactions from "@/app/(admin)/(others-pages)/(ecommerce)/transactions/page";

// Email
import Inbox from "@/app/(admin)/(others-pages)/(email)/inbox/page";
import InboxDetails from "@/app/(admin)/(others-pages)/(email)/inbox-details/page";

// Forms
import FormElements from "@/app/(admin)/(others-pages)/(forms)/form-elements/page";
import FormLayout from "@/app/(admin)/(others-pages)/(forms)/form-layout/page";

// Support
import SupportTicketReply from "@/app/(admin)/(others-pages)/(support)/support-ticket-reply/page";
import SupportTickets from "@/app/(admin)/(others-pages)/(support)/support-tickets/page";

// Tables
import BasicTables from "@/app/(admin)/(others-pages)/(tables)/basic-tables/page";
import DataTables from "@/app/(admin)/(others-pages)/(tables)/data-tables/page";

// Task
import TaskKanban from "@/app/(admin)/(others-pages)/(task)/task-kanban/page";
import TaskList from "@/app/(admin)/(others-pages)/(task)/task-list/page";

// Other admin pages
import ApiKeys from "@/app/(admin)/(others-pages)/api-keys/page";
import Blank from "@/app/(admin)/(others-pages)/blank/page";
import Calendar from "@/app/(admin)/(others-pages)/calendar/page";
import Chat from "@/app/(admin)/(others-pages)/chat/page";
import Faq from "@/app/(admin)/(others-pages)/faq/page";
import FileManager from "@/app/(admin)/(others-pages)/file-manager/page";
import Integrations from "@/app/(admin)/(others-pages)/integrations/page";
import PricingTables from "@/app/(admin)/(others-pages)/pricing-tables/page";
import Profile from "@/app/(admin)/(others-pages)/profile/page";

// UI elements
import Alerts from "@/app/(admin)/(ui-elements)/alerts/page";
import Avatars from "@/app/(admin)/(ui-elements)/avatars/page";
import Badge from "@/app/(admin)/(ui-elements)/badge/page";
import Breadcrumb from "@/app/(admin)/(ui-elements)/breadcrumb/page";
import Buttons from "@/app/(admin)/(ui-elements)/buttons/page";
import ButtonsGroup from "@/app/(admin)/(ui-elements)/buttons-group/page";
import Cards from "@/app/(admin)/(ui-elements)/cards/page";
import Carousel from "@/app/(admin)/(ui-elements)/carousel/page";
import Dropdowns from "@/app/(admin)/(ui-elements)/dropdowns/page";
import Images from "@/app/(admin)/(ui-elements)/images/page";
import Links from "@/app/(admin)/(ui-elements)/links/page";
import List from "@/app/(admin)/(ui-elements)/list/page";
import Modals from "@/app/(admin)/(ui-elements)/modals/page";
import Notifications from "@/app/(admin)/(ui-elements)/notifications/page";
import Pagination from "@/app/(admin)/(ui-elements)/pagination/page";
import Popovers from "@/app/(admin)/(ui-elements)/popovers/page";
import ProgressBar from "@/app/(admin)/(ui-elements)/progress-bar/page";
import Ribbons from "@/app/(admin)/(ui-elements)/ribbons/page";
import Spinners from "@/app/(admin)/(ui-elements)/spinners/page";
import Tabs from "@/app/(admin)/(ui-elements)/tabs/page";
import Tooltips from "@/app/(admin)/(ui-elements)/tooltips/page";
import Videos from "@/app/(admin)/(ui-elements)/videos/page";

// Auth pages
import ResetPassword from "@/app/(full-width-pages)/(auth)/reset-password/page";
import Signin from "@/app/(full-width-pages)/(auth)/signin/page";
import Signup from "@/app/(full-width-pages)/(auth)/signup/page";
import TwoStepVerification from "@/app/(full-width-pages)/(auth)/two-step-verification/page";

// Error pages
import Error404 from "@/app/(full-width-pages)/(error-pages)/error-404/page";
import Error500 from "@/app/(full-width-pages)/(error-pages)/error-500/page";
import Error503 from "@/app/(full-width-pages)/(error-pages)/error-503/page";
import Maintenance from "@/app/(full-width-pages)/(error-pages)/maintenance/page";

// Misc full-width
import ComingSoon from "@/app/(full-width-pages)/coming-soon/page";
import Success from "@/app/(full-width-pages)/success/page";

// 404 catch-all
import NotFound from "@/app/not-found";

// New auth module (src/modules/auth)
import {
  LoginPage as AuthLoginPage,
  RegisterPage as AuthRegisterPage,
  TwoFactorPage as AuthTwoFactorPage,
  ForgotPasswordPage as AuthForgotPasswordPage,
} from "@/modules/auth";

// New HR module (src/modules/hr)
import {
  EmployeeAnalyticsPage as HrEmployeeAnalytics,
  EmployeesPage as HrEmployees,
  PostWorkingPage as HrPostWorking,
} from "@/modules/hr";

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Ecommerce /> },

      { path: "analytics", element: <Analytics /> },
      { path: "crm", element: <Crm /> },
      { path: "logistics", element: <Logistics /> },
      { path: "marketing", element: <Marketing /> },
      { path: "saas", element: <Saas /> },
      { path: "stocks", element: <Stocks /> },

      { path: "code-generator", element: <CodeGenerator /> },
      { path: "image-generator", element: <ImageGenerator /> },
      { path: "text-generator", element: <TextGenerator /> },
      { path: "video-generator", element: <VideoGenerator /> },

      { path: "bar-chart", element: <BarChart /> },
      { path: "line-chart", element: <LineChart /> },
      { path: "pie-chart", element: <PieChart /> },

      { path: "add-product", element: <AddProduct /> },
      { path: "billing", element: <Billing /> },
      { path: "create-invoice", element: <CreateInvoice /> },
      { path: "invoices", element: <Invoices /> },
      { path: "products-list", element: <ProductsList /> },
      { path: "single-invoice", element: <SingleInvoice /> },
      { path: "single-transaction", element: <SingleTransaction /> },
      { path: "transactions", element: <Transactions /> },

      { path: "inbox", element: <Inbox /> },
      { path: "inbox-details", element: <InboxDetails /> },

      { path: "form-elements", element: <FormElements /> },
      { path: "form-layout", element: <FormLayout /> },

      { path: "support-ticket-reply", element: <SupportTicketReply /> },
      { path: "support-tickets", element: <SupportTickets /> },

      { path: "basic-tables", element: <BasicTables /> },
      { path: "data-tables", element: <DataTables /> },

      { path: "task-kanban", element: <TaskKanban /> },
      { path: "task-list", element: <TaskList /> },

      { path: "api-keys", element: <ApiKeys /> },
      { path: "blank", element: <Blank /> },
      { path: "calendar", element: <Calendar /> },
      { path: "chat", element: <Chat /> },
      { path: "faq", element: <Faq /> },
      { path: "file-manager", element: <FileManager /> },
      { path: "integrations", element: <Integrations /> },
      { path: "pricing-tables", element: <PricingTables /> },
      { path: "profile", element: <Profile /> },

      { path: "alerts", element: <Alerts /> },
      { path: "avatars", element: <Avatars /> },
      { path: "badge", element: <Badge /> },
      { path: "breadcrumb", element: <Breadcrumb /> },
      { path: "buttons", element: <Buttons /> },
      { path: "buttons-group", element: <ButtonsGroup /> },
      { path: "cards", element: <Cards /> },
      { path: "carousel", element: <Carousel /> },
      { path: "dropdowns", element: <Dropdowns /> },
      { path: "images", element: <Images /> },
      { path: "links", element: <Links /> },
      { path: "list", element: <List /> },
      { path: "modals", element: <Modals /> },
      { path: "notifications", element: <Notifications /> },
      { path: "pagination", element: <Pagination /> },
      { path: "popovers", element: <Popovers /> },
      { path: "progress-bar", element: <ProgressBar /> },
      { path: "ribbons", element: <Ribbons /> },
      { path: "spinners", element: <Spinners /> },
      { path: "tabs", element: <Tabs /> },
      { path: "tooltips", element: <Tooltips /> },
      { path: "videos", element: <Videos /> },

      // HR module
      {
        path: "hr",
        children: [
          { path: "employee-analytics", element: <HrEmployeeAnalytics /> },
          { path: "employees", element: <HrEmployees /> },
          { path: "post-working", element: <HrPostWorking /> },
        ],
      },
    ],
  },
  {
    element: <FullWidthLayout />,
    children: [
      { path: "coming-soon", element: <ComingSoon /> },
      { path: "success", element: <Success /> },
      { path: "error-404", element: <Error404 /> },
      { path: "error-500", element: <Error500 /> },
      { path: "error-503", element: <Error503 /> },
      { path: "maintenance", element: <Maintenance /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "signin", element: <Signin /> },
          { path: "signup", element: <Signup /> },
          { path: "reset-password", element: <ResetPassword /> },
          { path: "two-step-verification", element: <TwoStepVerification /> },
          {
            path: "auth",
            children: [
              { path: "login", element: <AuthLoginPage /> },
              { path: "register", element: <AuthRegisterPage /> },
              { path: "two-factor", element: <AuthTwoFactorPage /> },
              { path: "forgot-password", element: <AuthForgotPasswordPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
