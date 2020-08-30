import React, { PureComponent } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import axios from 'axios';
import moment from 'moment';
import MaterialTable from 'material-table'


import dbData from './db.json';

const apiPath = "http://localhost:3030"

const orderDemoData = {}
dbData.orders.map(order => {
  let created = Number(moment(order.created).format('DD'))
  if (orderDemoData[created]) {
    orderDemoData[created].orderCount = orderDemoData[created].orderCount + 1
    orderDemoData[created].price = orderDemoData[created].price + Number(order.price)
  } else {
    orderDemoData[created] = {}
    orderDemoData[created].orderCount = 1
    orderDemoData[created].price = Number(order.price)
    orderDemoData[created].created = created
  }
})

Array.from({ length: 31 }, (value, index) => {
  index = index + 1
  if (!orderDemoData[index]) {
    orderDemoData[index] = {}
    orderDemoData[index].orderCount = 0
    orderDemoData[index].price = 0
    orderDemoData[index].created = index
  }
  return null
})

const orderData = Object.values(orderDemoData).sort(function (a, b) { return a.created - b.created })
const customerData = dbData.customers

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      customersAPIData: [],
      analyticsAPIData: [],
      ordersAPIData: [],
      orders: orderData,
      customers: customerData
    }
  }
  componentDidMount() {
    this.getCustomer()
    this.getOrder()
    this.getAnalytics()
  }

  getCustomer = () => {
    axios.get(apiPath + '/customers')
      .then(response => {
        var customersAPIData = response.data
        customersAPIData.map((customer, index) => { customersAPIData[index]['orders'] = customer.orders.length })
        this.setState({ customersAPIData: customersAPIData })
      })
      .catch(error => {
        console.log("error", error)
      })
  }

  getOrder = () => {
    axios.get(apiPath + '/orders')
      .then(response => {
        this.setState({ ordersAPIData: response.data })
      })
      .catch(error => {
        console.log("error", error)
      })
  }

  getAnalytics = () => {
    axios.get(apiPath + '/analytics')
      .then(response => {
        let analyticsAPIData = Array.from({ length: 31 }, (value, index) => {
          index = index + 1
          let isDayPresent = response.data.findIndex(analytics => { return analytics.day == index })
          if (isDayPresent == -1) {
            return {
              orderCount: 0,
              totalPrice: 0,
              day: index
            }
          } else {
            return response.data[isDayPresent]
          }
        })
        this.setState({ analyticsAPIData: analyticsAPIData })
      })
      .catch(error => {
        console.log("error", error)
      })
  }

  render() {
    return (
      <div style={{ display: 'grid' }}>
        <div>
          <center><h3>Frontend - Showing graph & table from db.json</h3></center>
          <style>
            {`
         .chart{
           width: 50%;
           margin-top: 50px;
           over-flow: none;
         }
         @media screen and (max-width: 660px) {
          .chart{
            width: 100%;
          }
        }
         `}
          </style>
          <div className="chart" style={{ height: 400, float: 'left' }}>
            <center><h4>Order Count</h4></center>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={this.state.orders}
                margin={{
                  top: 20, right: 20, bottom: 20, left: 20,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" domain={[1, 31]} dataKey="created" tickCount={31} />
                <YAxis yAxisId="left" orientation="left" stroke="#413ea0" label={{ value: 'Order Count', angle: -90, dx: -10 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="orderCount" barSize={20} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="chart" style={{ height: 400, float: 'right' }}>
            <center><h4>Order Total Price</h4></center>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={this.state.orders}
                margin={{
                  top: 20, right: 20, bottom: 20, left: 10,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" domain={[1, 31]} dataKey="created" tickCount={31} />
                <YAxis yAxisId="left" orientation="left" stroke="413ea0" label={{ value: 'Total Price', angle: -90, dx: -25 }} />
                <Tooltip />
                <Legend />
                <Line dot={false} yAxisId="left" type="monotone" dataKey="price" stroke="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ width: "96%", margin: 30, marginTop: 100 }}>
          <MaterialTable
            title="Customers List"
            columns={[
              { title: 'Id', field: 'id' },
              { title: 'First Name', field: 'firstName' },
              { title: 'Last Name', field: 'lastName' },
              { title: 'Email', field: 'email' },
              { title: 'Created', field: 'created' },
              { title: 'Orders', field: 'orders' }
            ]}
            data={this.state.customers}
          />
        </div>

        <center><h3>Full Stack Frontend - Showing graph & table from API</h3></center>
        <div>
          <div className="chart" style={{ height: 400, float: 'left' }}>
            <center><h4>Order Count</h4></center>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={this.state.analyticsAPIData}
                margin={{
                  top: 20, right: 20, bottom: 20, left: 20,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" domain={[1, 31]} dataKey="day" tickCount={31} />
                <YAxis yAxisId="left" orientation="left" stroke="#413ea0" label={{ value: 'Order Count', angle: -90, dx: -10 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="orderCount" barSize={20} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="chart" style={{ height: 400, float: 'right' }}>
            <center><h4>Order Total Price</h4></center>
            <ResponsiveContainer>
              <ComposedChart
                width={500}
                height={400}
                data={this.state.analyticsAPIData}
                margin={{
                  top: 20, right: 20, bottom: 20, left: 10,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" domain={[1, 31]} dataKey="day" tickCount={31} />
                <YAxis yAxisId="left" orientation="left" stroke="413ea0" label={{ value: 'Total Price', angle: -90, dx: -25 }} />
                <Tooltip />
                <Legend />
                <Line dot={false} yAxisId="left" type="monotone" dataKey="totalPrice" stroke="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ width: "96%", margin: 30, marginTop: 100 }}>
          <MaterialTable
            title="Customers List From API"
            columns={[
              { title: 'Id', field: '_id' },
              { title: 'First Name', field: 'firstName' },
              { title: 'Last Name', field: 'lastName' },
              { title: 'Email', field: 'email' },
              { title: 'Created', field: 'created' },
              { title: 'Orders', field: 'orders' }
            ]}
            data={this.state.customersAPIData}
          />
        </div>
        <div style={{ width: "96%", margin: 30, marginTop: 100 }}>
          <MaterialTable
            title="Orders List From API"
            columns={[
              { title: 'Id', field: '_id' },
              { title: 'Customer', field: 'customer' },
              { title: 'Product', field: 'product' },
              { title: 'Quantity', field: 'quantity' },
              { title: 'Price', field: 'price' },
              { title: 'Created', field: 'createdAt' }
            ]}
            data={this.state.ordersAPIData}
          />
        </div>
        <div style={{ width: "96%", margin: 30, marginTop: 100 }}>
          <MaterialTable
            title="Analytics List From API"
            columns={[
              { title: 'Day', field: 'day' },
              { title: 'Order Count', field: 'orderCount' },
              { title: 'Total Price', field: 'totalPrice' }
            ]}
            data={this.state.analyticsAPIData}
            row={10}
          />
        </div>
      </div>
    );
  }
}

export default App;
