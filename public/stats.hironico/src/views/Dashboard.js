import React from "react";
import ChartByCountry from "../components/ChartByCountry";
import ChartByPlatform from '../components/ChartByPlatform';
import TableLastRequests from "../components/TableLastRequests";

function Dashboard() {

    return (
        <div className="dashboard">

            <div className="header">
                <h1>Hironico's webstats</h1>
                <div className="header-tools">
                    <a href="/">Return to site</a>
                    <a href=".">Reload</a>
                </div>
            </div>

            <div className="main">
                <div className="card-dark sidebar">
                    <h3>Menu</h3>
                    
                </div>

                <div className="contents">
                    <ChartByCountry />                                  
                    <ChartByPlatform />
                    <TableLastRequests /> 
                </div>
            </div>

            <div className="footer">
                <h4>Made with love in Switzerland</h4>
            </div>

        </div>



    );

}

export default Dashboard;