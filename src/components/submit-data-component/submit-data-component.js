import React, { Component } from "react";
import _ from "lodash";

import axios from "axios";

// import { TiTick } from "react-icons/ti";
// import { ImCross } from "react-icons/im";

import { Button, FormFile } from "react-bootstrap";

import AppContext from "../../AppContext";

class SubmitData extends Component {
    //static contextType = AppContext;

    constructor(props) {
        super(props);

        this.state = {
            currentProject: {},
            jsonFile: {},
            previousProjects: [],
        };

        this.fileOnload = this.fileOnload.bind(this);
    }

    componentDidMount() {
        this.initialiseState();
        //console.log(this.context);
        //console.log(navigator.onLine);
    }
    componentDidUpdate() {
        //const newContext = _.cloneDeep(this.state.currentProject);
        //this.context = newContext;
        //console.log(this.context);
    }

    initialiseState = () => {
        const appNames = {};

        const appVariables = [
            "agroEcoData",
            "contextScores",
            "location",
            "pairWiseScores",
            "participatoryMatrixScores",
            "projectInfo",
            "results",
            "user",
        ];

        const appData = {};

        appVariables.map((variable) => {
            if (this.context[variable] !== undefined) {
                appData[variable] = _.cloneDeep(this.context[variable]);
            }
        });

        this.setState({ currentProject: appData });
    };

    setContext = () => {
        console.log(this.state);
        const appNames = {};

        const appVariables = [
            "agroEcoData",
            "contextScores",
            "location",
            "pairWiseScores",
            "participatoryMatrixScores",
            "projectInfo",
            "results",
            "user",
        ];

        const appData = {};

        appVariables.map((variable) => {
            if (this.state.currentProject[variable] !== undefined) {
                this.context[variable] = _.cloneDeep(
                    this.state.currentProject[variable]
                );
            }
        });
        console.log(this.context);
        //this.context = appData;
    };

    submitData = () => {
        const dataToSubmit = _.cloneDeep(this.state.currentProject);
        // console.log(dataToSubmit);
        axios({
            method: "post",
            //url: "http://localhost:5000/api/projects/submit-data/",
            url: "https://l-gorman.com/api/projects/submit-data/",
            data: dataToSubmit,
            headers: {
                accept: "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        })
            .then((response) => {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    retrieveProjects = () => {
        axios({
            method: "get",
            url: "https://l-gorman.com/api/projects/get-projects/",
            headers: {
                accept: "application/json",
            },
        })
            .then((response) => {
                this.setState({
                    previousProjects: response.data,
                });
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    downLoadData = () => {
        return (
            <a
                type="button"
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(this.state)
                )}`}
                download="filename.json"
            >
                <Button>Save Progress</Button>
            </a>
        );
    };

    uploadData = () => {
        return (
            // Good tutorial on file upload
            <div>
                {/* <input type="file" name="file" onChange={this.fileUploader} />
                <div> */}
                <FormFile
                    className="button-primary"
                    onChange={this.fileUploadButton}
                />
                {/* </div> */}
            </div>
        );
    };

    fileUploader = () => {};

    fileOnload = (event) => {
        // The file's text will be printed here
        // console.log(JSON.parse(event.target.result));
        const jsonFile = JSON.parse(event.target.result);
        this.setState(
            { currentProject: jsonFile.currentProject },
            //() => (this.context.currentProject = jsonFile.currentProject)
            () => {
                this.setState(
                    {
                        currentProject: jsonFile.cur,
                    },
                    () => {
                        this.setContext();
                    }
                );
            }
        );
    };

    fileUploadButton = (event) => {
        //console.log(event.target.files[0]);
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = this.fileOnload;
        reader.readAsText(event.target.files[0]);
    };

    render() {
        return (
            <div>
                <h1>App Context</h1>
                <Button onClick={this.submitData}>Submit</Button>
                <Button onClick={this.retrieveProjects}>
                    Get all Projects
                </Button>
                {this.downLoadData()}
                {this.uploadData()}
                {/* A button to upload data */}

                {/* <h1>Current Project</h1>
                <pre>{JSON.stringify(this.state.currentProject, null, 2)}</pre>
                <h1>Fetched projects</h1>
                <pre>
                    {JSON.stringify(this.state.previousProjects, null, 2)}
                </pre> */}
            </div>
        );
    }
}
SubmitData.contextType = AppContext;

export default SubmitData;
