import './App.css';
import axios from 'axios'
import React, {useState, useEffect} from "react";
import Select from 'react-select'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {GoogleMap, LoadScript, Marker} from "@react-google-maps/api";
import {Flex} from '@adobe/react-spectrum'
import logo from './png/gas-pump.png';
import Table from 'react-bootstrap/Table'


function GasStations() {
    const [apiA, setApiA] = useState([]);
    const [apiB, setApiB] = useState([]);
    const [gas, setGas] = useState("Super")
    const [open, setOpen] = useState("")
    const  [ selectedOption ,  setSelectedOption ]  =  useState ( "null" ) ;
    const  [ selectedPosition ,  setSelectedPosition ]  =  useState ([]) ;
    const defaultCenter = {lat :parseFloat(selectedOption.lat), lng : parseFloat(selectedOption.lng)}

    useEffect(function () {
        (async () => {
             await api_A()
            setSelectedOption({value:"wien", label:"wien", lat : "48.2082", lng: "16.3738"})
        })()
    },[]);

    const changeGas = () => {
        if (gas === "Diesel"){
            setGas("Super")
        }else {
            setGas("Diesel")
        }
    }
    const mapStyles = {
        height: "50vh",
        width: "100%"};


    const api_B = () => {
        let latitude = selectedOption.lat;
        let longitude = selectedOption.lng;
        let myUrlDiesel = "https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude="+ latitude+ "&longitude=" + longitude + "&fuelType=DIE&includeClosed=false"
        let myUrlSuper = "https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude="+ latitude+ "&longitude=" + longitude + "&fuelType=SUP&includeClosed=false"
        let myUrl = ""
        if (gas === "Diesel"){
            myUrl =myUrlDiesel
        }else {
            myUrl = myUrlSuper
        }
        axios.get(myUrl)
            .then(async function (response) {
                // handle success
                let result = response.data.filter((item) => item["prices"].length !== 0)
                console.log(result)
                await setApiB(result)
                let list = [{name: result[0].id, location: {lat: parseFloat(result[0].location.latitude), lng: parseFloat(result[0].location.longitude)}}]
                let index = 1;
                while (result.length !== index){
                    list.push({name: result[index].id, location: {lat: parseFloat(result[index].location.latitude), lng: parseFloat(result[index].location.longitude)}})

                    index++;
                }
                setSelectedPosition(list)
                if(result[0].open === true){
                    setOpen("Open")
                }else {
                    setOpen("Close")
                }

            })
            .catch(function (error) {
                console.log(error);
            });


    }

    async function api_A () {
        axios.get('https://api.e-control.at/sprit/1.0/regions/units')
            .then(function (response) {
                console.log(response)
                let result = response.data.filter( (item) => item.b[0].g.length !== 0 )
                let lng = result[0].b[0].g[0].l;
                let lat = result[0].b[0].g[0].b;
                let label = result[0].b[0].g[0].n;
                let value = result[0].b[0].g[0].n;
                let list = [{ label, value, lat, lng}];
                let index1 = 0;

                while(result.length !== index1){
                    let final_data = result[index1];
                    let index2 = 0;
                    while (final_data.b.length !== index2 ){
                        let index3 = 0;
                        while (final_data.b[index2].g.length !== index3 ){
                            let label = final_data.b[index2].g[index3].n;
                            let value = final_data.b[index2].g[index3].n;
                            let lng = final_data.b[index2].g[index3].l;
                            let lat = final_data.b[index2].g[index3].b;
                            if (index1 === 0 && index2 === 0 && index3 === 0){
                                console.log("error")
                            }else {
                                list.push({label,value, lat, lng})
                            }


                            index3++;
                        }
                        index2++;
                    }
                    index1++;
                }
                setApiA(list);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return (
        <div className="App" style={{marginTop : "2%" , minWidth: 322, marginLeft: "15%", marginRight: "15%"}} >
            <div>
                <div style={{padding: 10}}><img src={logo} alt="Logo" sizes={15} /></div>
                <Flex direction="row" height="size-30000" gap="size-1000">
                    <BootstrapSwitchButton  onstyle="outline-secondary" width={100} offstyle="info" onChange={changeGas} onlabel={"Diesel"} offlabel={"Super"} />
                    <div style={{width: "100%"}}><Select options={apiA}
                                 onChange = {setSelectedOption}
                                 defaultMenuIsOpen={false}
                    /></div>

                </Flex>

                <button style={{margin: 6}} type="button" className="btn btn-secondary btn-sm" onClick={api_B}>Tankstellen finden</button>


                {apiB.map(element =>
                    <Table striped bordered hover responsive="xl">
                        <tbody key={element.id}>
                        <tr>
                            <td style={{width: "60%", alignItems: "center", justifyContent: "center"}}><h5>{element.name}</h5></td>
                            <td style={{width: "23%",  alignItems: "center", justifyContent: "center"}}>{element.prices[0].amount + "€"}</td>
                            {open === "Open"
                                ? <td style={{color: "green", width: "17%",  alignItems: "center", justifyContent: "center"}}>{open}</td>
                                : <td style={{color: "red", width: "17%",  alignItems: "center", justifyContent: "center"}}>{open}</td>
                            }
                        </tr>
                        </tbody>
                    </Table>
                )}


                <div style={{height: "50vh"}}>
                <LoadScript
                    googleMapsApiKey="AIzaSyCWn7uIR_pfoRnwf83uAQQ7GmqKp4nMq5o">
                    <GoogleMap
                        mapContainerStyle={mapStyles}
                        zoom={10}
                        center={defaultCenter}>
                        {
                            selectedPosition.map(item => {
                                return (
                                    <Marker key={item.name} position={item.location}/>
                                )
                            })
                        }
                    </GoogleMap>
                </LoadScript>
                </div>
            </div>
        </div>
    );
}

export default GasStations;
