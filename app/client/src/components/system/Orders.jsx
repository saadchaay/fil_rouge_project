import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Delete, Info } from "@material-ui/icons";
import { gapi } from "gapi-script";
import axios from "../../api/axios";

const API_KEY = "AIzaSyD8sJuOu8T7-LPBhUFbrGOKh_tzTUnj0xs";
const CLIENT_ID =
  "280216831650-f9dn7qig5117unbvtfsnlusk5kjda32l.apps.googleusercontent.com";
const SCOPE = "https://www.googleapis.com/auth/drive";

const statusStyles = {
  pending: "bg-gray-500 text-white",
  confirmed: "bg-green-600 text-white",
  canceled: "bg-orange-500 text-white",
  processing: "bg-blue-600 text-white",
  failed: "bg-pink-700 text-white",
  payed: "bg-green-700 text-white",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Orders() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = JSON.parse(localStorage.getItem("token"));
  const [orders, setOrders] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [spreadsheet, setSpreadsheet] = useState([]);
  const [sheet, setSheet] = useState("");
  const id_admin = auth.role === "admin" ? auth.id : auth.id_admin;

  const getFiles = async () => {
    const res = await axios.get("SheetsController/index/" + id_admin);
    setSpreadsheet(res.data);
    console.log(token);
  };

  const handleOrderFromSheet = async (e) => {
    e.preventDefault();
    const sheetID = sheet;
    console.log(sheetID);
    console.log(gapi);
    var accessToken = gapi.auth.getToken().access_token;
    const object = {};
    const response = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets/" +
        sheetID +
        "/values/A1:Z1000",
      {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
      }
    );
    // console.log(response.json());
    response.json().then((data) => {
      console.log(data);
      data.values.forEach((item, index) => {
        object[index] = {
          id: item[0],
          date: item[1],
          customer: item[2],
          address: item[3],
          city: item[4],
          phone: item[5],
          product: item[6],
          sku: item[7],
          colors: item[8],
          sizes: item[9],
          quantity: item[10],
          total: item[11],
        };
      });
      delete object[0];
      console.log(object);
      const dataJss = {
        admin: id_admin,
        orders: object,
      };
      console.log(dataJss);
      axios
        .post(
          "OrdersController/store",
          JSON.stringify(dataJss),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          console.log(res);
          if (res.status === 201) {
            fetchOrder();
            setSuccess(true);
          } else {
            fetchOrder();
            const newErr = {};
            if (res.data.message) {
              newErr.message = res.data.message;
            }
            setError(newErr);
          }
        });
    });
  };

  const fetchOrder = async () => {
    const id_admin = auth.role === "admin" ? auth.id : auth.id_admin;
    const response = await axios.get("OrdersController/index/" + id_admin);
    if (response.status === 201) {
      setOrders(response.data);
      console.log(response.data);
    } else {
      console.log(response.status);
    }
  };

  const handleDeleteOrder = async (e, id) => {
    e.preventDefault();
    const response = await axios.delete("OrdersController/destroy/" + id);
    console.log(response);
    fetchOrder();
  };

  useEffect(() => {
    getFiles();
    function start() {
      gapi.client.init({
        apiKey: token.apiKey ? token.apiKey : API_KEY,
        client_id: token.clientId ? token.clientId : CLIENT_ID,
        scope: SCOPE,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
      });
    }
    gapi.load("client:auth2", start);
    fetchOrder();
  }, []);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <p className="mt-2 text-sm text-gray-700">
              A table of all your orders ..., you can also import your orders to
              our system from a google sheet.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              id="role"
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              autoComplete="country-name"
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            >
              <option>Choose google sheet file</option>
              {spreadsheet.map((sheet) => (
                <option key={sheet.id} value={sheet.spreadsheetId}>
                  {sheet.fileName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleOrderFromSheet}
              className="mt-2 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Import Orders
            </button>
          </div>
        </div>
        {error ? (
          error.message ? (
            <div
              className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Failed!</strong>
              <span className="ml-2 block sm:inline">
                { error.message }{" "}
                {error.messaage ? ", " + error.messaage : null}{" "}
              </span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError(null)}
              >
                <svg
                  className="fill-current h-6 w-6 text-red-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          ) : error.orderErr ? (
            <div
              className="mt-2 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Warning!</strong>
              <span className="ml-2 block sm:inline">
                Some orders is already exists{" "}
                {error.orderErr ? ", " + error.orderErr : null}{" "}
                {error.productErr ? ", " + error.productErr : null}
              </span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setSuccess(false)}
              >
                <svg
                  className="fill-current h-6 w-6 text-orange-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          ) : null
        ) : null}
        {success ? (
          <div
            className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="ml-2 block sm:inline">
              Imported all orders successfully
            </span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setSuccess(false)}
            >
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Total order
                      </th>
                      <th
                        scope="col"
                        className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            {order.reference}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                            {order.name}
                          </td>
                          <td className="whitespace-nowrap px -2 py-2 text-sm text-gray-900">
                            {order.phone}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                            {order.order_date}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                            <span
                              className={classNames(
                                (order.status === "Pending" &&
                                  statusStyles["pending"]) ||
                                  (order.status === "Processing" &&
                                    statusStyles["processing"]) ||
                                  (order.status === "Canceled" &&
                                    statusStyles["canceled"]) ||
                                  (order.status === "Failed" &&
                                    statusStyles["failed"]) ||
                                  (order.status === "Confirmed" &&
                                    statusStyles["confirmed"]) ||
                                  (order.status === "Payed" &&
                                    statusStyles["payed"]),
                                "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize"
                              )}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                            $ {order.total}
                          </td>
                          <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              to={`/orders/${order.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Info />
                              <span className="sr-only">, {order.id}</span>
                            </Link>
                            <button
                              onClick={(e) => handleDeleteOrder(e, order.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              <Delete />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8">
                          <div className="text-center py-2">
                            <div className="text-gray-500">
                              No Orders found.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
