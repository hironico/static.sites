import React from "react";
import { useEffect, useState } from "react";

const TableLastRequests = () => {

    const [tableData, setTableData] = useState(null);

    const fetchTableData = () => {
        const full = window.location.protocol + '//' + window.location.host;
        fetch(`${full}/api/webaccess/last/1000`)
            .then(resp => resp.json())
            .then(data => setTableData(data));
    }

    useEffect(() => {
        if (tableData === null) {
            fetchTableData();
        }
    });

    const renderTableBodyLastRequests = () => {
        if (tableData === null) {
            return <tr>
                <td colSpan={5}>
                    <h4>Loading...</h4>
                </td>
            </tr>
        }
        return tableData.map((visit, index) => {
            const country = `${visit.country} (${visit.country_code})`;
            return <tr className="row-last-requests" key={index}>
                <td>{visit.id}</td>
                <td>{visit.visit_datetime}</td>
                <td>{country}</td>
                <td>{visit.city}</td>
                <td>{visit.visit_url}</td>
            </tr>
        });
    }

    return (
        <div className="last-requests card-dark">
            <h4>Last visits</h4>
            <div className="table-container-last-requests">
                    <table className="table-last-requests">
                        <thead>
                            <tr>
                            <th>id</th>
                            <th>datetime</th>
                            <th>country</th>
                            <th>city</th>
                            <th>url</th>
                            </tr>                            
                        </thead>
                        <tbody>
                            {renderTableBodyLastRequests()}
                        </tbody>
                    </table>
            </div>            
        </div>

    );
}

export default TableLastRequests;