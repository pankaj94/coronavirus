import React from 'react';
import Chart from "react-google-charts";
import {getAPIdata} from './service';
import {urlMaps} from './urlMapping';
import './App.css';

const options = {
  title: "Coronavirus Cases and Recovered Stats",
  curveType: "function",
  legend: { position: "bottom" },
  pointSize : 4,
  colors : ['#d28e3e','blue']
};


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      isChartLoader : true,
      items: [],
      countryData : [],
      filterData : [],
      chartData : [],
      isMobile : false
    };
    
  }

  
  componentDidMount() {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      this.setState({
        isMobile : true
      })
    }
    this.getAllData();
    this.getCountryData('india');
    
  }

  getAllData = () => {
    getAPIdata(urlMaps.allStats).then(res => {
      if(res){
        this.setState({
          isLoaded: true,
          items: res,
          filterData :res
        });
      }
    });
  }

  getCountryData = (countryName) =>{
    getAPIdata(urlMaps.allStats +countryName).then(res => {
      this.setState({
        countryData : res
      },() =>{
        this.getHistoricalCountryData(countryName);
      })
    })
  }

  getHistoricalCountryData = (countryName) => {
    getAPIdata(urlMaps.getHistoricalDataByCountry+countryName).then(res => {
      const {countryData} = this.state;
      let startDateCounter = 0;
      const renderData = [];
      Object.keys(res.timeline.cases).map((item) => {
        if(res.timeline.cases[item] > 0 && startDateCounter > 0){
          startDateCounter = 1;
          renderData.push([new Date(item),res.timeline.cases[item],res.timeline.recovered[item]])
        }else if(res.timeline.cases[item] > 0 && startDateCounter == 0){
          startDateCounter = 1;
          renderData.push([new Date(item),res.timeline.cases[item],res.timeline.recovered[item]])
        }
        else{
          startDateCounter = 0;
        }
        
      })

      renderData.unshift(['Date','Cases Count','Recovered Count'])
      renderData.push([new Date(),countryData.cases,countryData.recovered])
      this.setState({
        chartData : renderData,
        isChartLoader : false
      })
    })
  }

  searchCountry = (event) => {
    const val = event.target.value;
    let {items,filterData}  = this.state;
    if(val!=''){
      const filterD = items.filter((item) => {
        if(item.country.toLowerCase().indexOf(val.toLowerCase()) > -1){
          return item;
        }
      })
      filterData = filterD;
    }else{
      filterData = items;
    }
    this.setState({filterData});
    
  }

  render() {
    const { error, isLoaded, items ,countryData,filterData, chartData,isChartLoader,isMobile} = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div className="loading">Loading...</div>;
    } else {
      return (
        <div>
          <div className="heading">Coronavirus Outbreak Information</div>
        
        <div className="parent-node">
          <div className="side-nav">
            <input type="text" placeholder="Search Country" onChange={this.searchCountry} />
              <ul className="">
              {filterData.map(item => (
                <li key={item.country} onClick={() => this.getCountryData(item.country)}>
                  <span className="text-red">{item.cases}</span>{item.country} 
                </li>
              ))}
            </ul>
          </div>
          <div className="center-nav">
            <h1>Based on Country you selected</h1>
              <div>Country Name : <strong>{countryData.country}</strong></div>
              <div>Total Cases : <strong>{countryData.cases}</strong></div>
              <div>Todays Cases : <strong>{countryData.todayCases}</strong></div>
              <div>Total Deaths : <strong>{countryData.deaths}</strong></div>
              <div>Today Deaths : <strong>{countryData.todayDeaths}</strong></div>
              <div>Total Recovered : <strong>{countryData.recovered}</strong></div>
              <div>Total Active : <strong>{countryData.active}</strong></div>
              <div>Total critical : <strong>{countryData.critical}</strong></div>
              <div>Cases Per Million : <strong>{countryData.casesPerOneMillion}</strong></div>
              {!isMobile && <section>
              {isChartLoader ? 'Loading...........' :<Chart
                  chartType="LineChart"
                  width="100%"
                  height="400px"
                  data={chartData}
                  options={options}
                />}
              </section>}
          </div>
        </div>
        {isMobile && <section>
              {isChartLoader ? 'Loading...........' :<Chart
                  chartType="LineChart"
                  width="100%"
                  height="400px"
                  data={chartData}
                  options={options}
                />}
              </section>}
        </div>
      );
    }
  }
}

export default App;