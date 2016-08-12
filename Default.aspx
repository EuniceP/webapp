<%@ Page Language="C#" %>

<!DOCTYPE html>

<script runat="server">
    protected void Page_Load(Object s, EventArgs e)
    {
        Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
        Response.Cache.SetNoStore();
    }
</script>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Turing</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <!-- Internal Vendor Stylesheets -->
    <link rel="stylesheet" href="vendor/bootstrap/3.3.1/css/bootstrap.min.css" />
    <link rel="stylesheet" href="vendor/bootstrap/3.3.1/css/bootstrap-theme.min.css" />
    <link rel="stylesheet" href="vendor/jqueryui/1.11.2/jquery-ui.min.css"/>
    <link rel="stylesheet" href="vendor/jqueryui/1.11.2/jquery-ui.theme.min.css"/>
    <link rel="stylesheet" href="vendor/font-awesome/4.2.0/css/font-awesome.min.css"/>
    <link rel="stylesheet" href="vendor/datatables/1.10.10/datatables.min.css"/>

    <!-- Internal Stylesheets -->
    <link rel="stylesheet" href="css/index.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="pages/css/Menu.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="pages/css/Reports.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="pages/css/SelfServe.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="pages/css/Dashboard.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="pages/css/Alerts.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="components/css/DashBoardTile.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="components/css/BranchSelection.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />
    <link rel="stylesheet" href="tiles/css/tile.css?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>" />

    <!-- Internal Vendor Libraries -->
    <script type="text/javascript" src="vendor/jquery/2.1.3/jquery-2.1.3.min.js"></script>
    <script type="text/javascript" src="vendor/bootstrap/3.3.1/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="vendor/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <script type="text/javascript" src="vendor/datatables/1.10.10/datatables.min.js"></script>
    <script type="text/javascript" src="js/echarts/echarts.js"></script>
    <script type="text/javascript" src="vendor/numeral/numeral.min.js"></script>
    <script type="text/javascript" src="vendor/blockUI/blockUI.js"></script>
    <script type="text/javascript" src="vendor/Keyframes/jquery.keyframes.min.js"></script>

    <!-- Internal Custom Libraries -->
    <script type="text/javascript" src="js/AnalyticsDashboard/Utils.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/resources.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/index.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/controller.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="pages/js/Menu.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="pages/js/Dashboard.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="pages/js/Reports.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="pages/js/SelfServe.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="pages/js/Alerts.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="tiles/js/AlertsTile.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="tiles/js/GenericTile.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="components/js/DashboardTile.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="components/js/BranchSelection.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_bar.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_bar_line.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_line.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_pie.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_dynamic.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
    <script type="text/javascript" src="js/AnalyticsDashboard/graph/graph_tree.js?v=<%=ConfigurationManager.AppSettings["VersionNumber"]%>"></script>
</head>
<body>
    <!-- Temporary Change User Select -->
    <div style="position: absolute; top:0; right: 17px; z-index: 10000;">
	    <select id="change-user"></select>
    </div>
    <div id="wrapper">
        <!-- Cogs -->
        <div style="position:relative;">
		    <div class="cog-container">
                <i class="glyphicon glyphicon-cog cog-rotate-reverse cog cog-lg" style="top: -58px; right: 125px; z-index:3;"></i>
			    <i class="glyphicon glyphicon-cog cog-rotate cog cog-xl" style="z-index:2;"></i>
                <i class="glyphicon glyphicon-cog cog-rotate-reverse cog cog-md" style="top: -89px; right: 81px; z-index:3;"></i>
                <i class="glyphicon glyphicon-cog cog-rotate cog cog-xs block-ui-cog" style="top: 87px; right: 59px;"></i>
                <i class="glyphicon glyphicon-cog cog-rotate cog cog-xs block-ui-cog" style="top: 68px; right: 117px;"></i>
                <i class="glyphicon glyphicon-cog cog-rotate-reverse cog cog-sm" style="top: 3px; right: 50px; z-index:15;"></i>
                <i class="glyphicon glyphicon-cog cog-rotate-reverse cog cog-md block-ui-cog" style="top: 81px; right: -67px;"></i>
		    </div>
	    </div>
        <!-- Navigation -->
        <nav class="navbar navbar-default" role="navigation">
            <div class="app-name-container">
                <a class="navbar-brand engraved-text" href="#">TURING</a>
            </div>
            <!-- Classic Header -->
            <ul class="nav navbar navbar-left navbar-top-links pages" style="display:none;">
              <li><a href="#" action="analytics-dashboard" target-id="analytics-dashboard">Analytics Dashboard</a></li>
              <li><a href="#" action="reports" target-id="traditional-reports">Enterprise Reports</a></li>
              <li><a href="#" action="self-serve" target-id="self-serve">Self Serve Data Analytics</a></li>
            </ul>
            <!-- /.navbar-header -->
            <ul class="nav navbar-top-links navbar-right navbar-display-user">
                <li style="display:none;">Logged in as <span id="disp_user_name" name="user_name"></span></li>
            </ul>
        </nav>
        <div class="access-denied-div" style="display:none;">Access Denied</div>
    </div>
    <div id="modalContainer"></div>
</body>
</html>
