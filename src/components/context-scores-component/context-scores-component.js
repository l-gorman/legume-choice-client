import React from "react";

// Context scores data is based off of data-entry data
import { ContextScoreData } from "./context-scores-data";
import { Card } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import _ from "lodash";

import RadarChart from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";

import "./context-scores-component.css";
import "../data-entry-component/data-entry-component.css";
import AppContext from "../../AppContext";

class ContextScore extends React.Component {
    constructor(props) {
        super(props);

        this.state = _.cloneDeep(ContextScoreData);
    }

    // Checking for previously existing context, and update state with that previous information
    componentDidMount() {
        if (this.context.currentProject === undefined) {
            this.context.currentProject = {};
        }

        if (this.context.currentProject.contextScores !== undefined) {
            const newState = _.cloneDeep(
                this.context.currentProject.contextScores
            );
            this.setState(newState);
        }
        if (this.context.currentProject.contextScores === undefined) {
            const newContext = _.cloneDeep(this.state);
            this.context.currentProject.contextScores = newContext;
        }
    }

    // Update context with new state
    componentDidUpdate() {
        let newContext = _.cloneDeep(this.state);
        this.context.currentProject.contextScores = newContext;
    }

    //Taken from the react-svg-radar-chart documentation and adapted
    renderRadarChart = () => {
        const avergeScores = {};
        const scoreLabels = {};
        this.state.scores.forEach((score) => {
            if (score.scoreType === "average") {
                avergeScores[score.attribute.label] = score.score / 4;
                scoreLabels[score.attribute.label] = score.attribute.name;
            }
        });

        const radarData = [
            {
                data: avergeScores,
                meta: {
                    class: "radar-style",
                    color: "green",
                },
            },
        ];

        const noSmoothing = (points) => {
            let d =
                "M" + points[0][0].toFixed(4) + "," + points[0][1].toFixed(4);
            for (let i = 1; i < points.length; i++) {
                d +=
                    "L" +
                    points[i][0].toFixed(4) +
                    "," +
                    points[i][1].toFixed(4);
            }
            return d + "z";
        };

        const defaultOptions = {
            size: 200,
            axes: true, // show axes?
            scales: 4, // show scale circles?
            captions: true, // show captions?
            captionMargin: 10,
            dots: true, // show dots?
            zoomDistance: 1.2, // where on the axes are the captions?
            setViewBox: (options) =>
                `-${options.captionMargin} 0 ${
                    options.size + options.captionMargin * 2
                } ${options.size}`, // custom viewBox ?
            smoothing: noSmoothing, // shape smoothing function
            axisProps: () => ({ className: "axis" }),
            scaleProps: () => ({ className: "scale", fill: "none" }),
            shapeProps: () => ({ className: "shape" }),
            captionProps: () => ({
                className: "caption",
                textAnchor: "middle",
                fontSize: 10,
                fontFamily: "sans-serif",
            }),
            dotProps: () => ({
                className: "dot",
                mouseEnter: (dot) => {
                    console.log(dot);
                },
                mouseLeave: (dot) => {
                    console.log(dot);
                },
            }),
        };

        return (
            <div className="radar-container">
                <RadarChart
                    captions={scoreLabels}
                    data={radarData}
                    size={450}
                    options={defaultOptions}
                />
            </div>
        );
    };

    // Handling a change in an individual input.
    // Props includes the information on the individual input (person, typology, attribute)
    // to ensure the correct score is updated.
    // Following this, the average score is updated based on the new input
    handleChange = (event, props) => {
        props.score = parseInt(event.target.value); // Ensuring that the entered value is an integer
        let scoresArray = this.state.scores;
        console.log(props);

        scoresArray.forEach((element, index) => {
            console.log(element);
            if (element.scoreType == "individual") {
                if (
                    element.participant.label == props.participant.label &&
                    element.attribute.label == props.attribute.label &&
                    element.typology.label == props.typology.label
                ) {
                    scoresArray[index].score = parseInt(props.score);
                }
            }
        });

        this.setState(
            {
                scores: scoresArray,
            },
            // Update averages after new score
            () => this.averageAttributes()
        );
    };

    // updating all the averages
    averageAttributes = () => {
        const arr = _.cloneDeep(this.state.scores);

        this.state.attributes.forEach((attribute) => {
            let total = 0;
            let numberofscores = 0;

            arr.forEach((score) => {
                if (
                    score.scoreType === "individual" &&
                    score.attribute.label === attribute.label
                ) {
                    total += score.score;
                    console.log("total: " + total);
                    numberofscores += 1;
                    console.log("number of scores: " + numberofscores);
                }
            });
            const average = total / numberofscores;
            arr.forEach((score, scoreIndex) => {
                if (
                    score.scoreType === "average" &&
                    score.attribute.label === attribute.label
                ) {
                    console.log(average);
                    arr[scoreIndex].score = average;
                }
            });

            this.setState({
                scores: arr,
            });
        });

        // arr.forEach((score, scoreIndex) => {
        //     this.state.attributes.forEach((attribute) => {
        //         if (
        //             score.scoreType === "average" &&
        //             score.attribute.label === attribute.label
        //         ) {
        //             let average = this.averageAttribute(arr, attribute);
        //             console.log(average);
        //             arr[scoreIndex].score = average;
        //         }
        //     });
        // });
        this.setState({
            scores: arr,
        });
    };
    // Update Averages for specific element
    averageAttribute = (arr, attributetoAverage) => {
        let scores = 0;
        let scoresLength = 0;
        arr.forEach((element, index) => {
            if (
                element.attribute.label === attributetoAverage.label &&
                element.scoreType === "individual"
            ) {
                //scores.push(arr[index].score);
                scores += arr[index].score;
                scoresLength += 1;
            }
        });

        const average = scores / scoresLength;
        return average;
    };

    // Rendering the row average for the table
    renderRowAverage = (props) => {
        return this.state.scores.map((score) => {
            if (
                score.scoreType == "average" &&
                score.attribute.label == props.attribute.label
            ) {
                return <td>{score.score.toFixed(2)}</td>;
            }
        });
    };

    // Ensuring that the correct values are preselected in the table
    renderDefaultValue = (props) => {
        {
            let valueToReturn = "";
            this.state.scores.forEach((score) => {
                if (
                    score.scoreType === "individual" &&
                    score.attribute.label === props.attribute.label &&
                    score.participant.label === props.participant.label &&
                    score.typology.label === props.typology.label
                ) {
                    //console.log("found it: " + score.score);
                    valueToReturn = score.score;
                }
            });

            return valueToReturn;
        }
    };

    // A function for generating a row in the input table
    contextRow = (props) => {
        const rowAttribute = props.attribute;
        return (
            <tr>
                {/* Mapping across the different attributes to return a form to enter score (0-4).
                e.g 
                - Typology-low-> Farmer -> Land score
                - Typology-high -> Expert -> Seed score*/}
                <td>{rowAttribute.name}</td>
                {this.state.typologies.map((rowTypology) => {
                    return this.state.participants.map((rowParticipant) => {
                        return (
                            <td
                                key={
                                    "table-entry-" +
                                    rowTypology.name +
                                    "-" +
                                    rowParticipant.name +
                                    "-" +
                                    rowAttribute.name
                                }
                            >
                                <FormControl
                                    as="select"
                                    key={props.key}
                                    value={this.renderDefaultValue({
                                        typology: rowTypology,
                                        participant: rowParticipant,
                                        attribute: rowAttribute,
                                    })}
                                    onChange={(event) =>
                                        this.handleChange(event, {
                                            typology: rowTypology,
                                            participant: rowParticipant,
                                            attribute: rowAttribute,
                                        })
                                    }
                                    key={
                                        "form-control-" +
                                        rowTypology.name +
                                        "-" +
                                        rowParticipant.name +
                                        "-" +
                                        rowAttribute.name
                                    }
                                >
                                    {[0, 1, 2, 3, 4].map((score) => {
                                        return (
                                            <option
                                                key={
                                                    "form-option-" +
                                                    rowTypology.name +
                                                    "-" +
                                                    rowParticipant.name +
                                                    "-" +
                                                    rowAttribute.name +
                                                    "-" +
                                                    score
                                                }
                                            >
                                                {score}
                                            </option>
                                        );
                                    })}
                                </FormControl>
                            </td>
                        );
                    });
                })}
                {this.renderRowAverage({ attribute: rowAttribute })}
            </tr>
        );
    };

    // Using the contextRow and map functions to generate all of the rows in the table
    allRows = () => {
        if (this.state !== null) {
            // console.log("rendering all rows");
            return this.state.attributes.map((attribute) => {
                return this.contextRow({
                    attribute: attribute,
                    key: "context-row-" + attribute.name,
                });
            });
        } else {
            return <h1>Null State</h1>;
        }
    };

    // Creating the header for the table. This is a split header which accounts for typologies and participants
    tableHeader = () => {
        if (this.state !== null) {
            // console.log("Header rendering");
            return (
                <thead>
                    {/* Adding The typology Headers */}
                    <tr>
                        <th rowSpan="2"></th>
                        {this.state.typologies.map((typology) => {
                            return (
                                <th
                                    key={"typology-header" + typology.name}
                                    colSpan="2"
                                >
                                    Typology - {typology.name}
                                </th>
                            );
                        })}
                        {/* Adding The Average Score Headers */}

                        <th key="average-header" rowSpan="2">
                            Mean Score (0-4)
                        </th>
                    </tr>
                    {/* Adding The Participant Headers */}
                    <tr key="participant-header-row">
                        {this.state.typologies.map((typology) => {
                            return this.state.participants.map(
                                (participant) => {
                                    return (
                                        <th
                                            key={
                                                "participant-header" +
                                                participant.name
                                            }
                                        >
                                            {participant.name}
                                        </th>
                                    );
                                }
                            );
                        })}
                    </tr>
                </thead>
            );
        } else {
            return <h1>Null State</h1>;
        }
    };

    render() {
        return (
            <div className="radar-container">
                <div className="card-container">
                    <Card>
                        <Card.Header className="bg-dark text-white">
                            <h2>Context Assessment</h2>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                The purpose of the exercise is to come up with a
                                series of scores from zero to four that indicate
                                the strength of a series of generic constraints
                                to legume production. The exercise is carried
                                out with a group – the questions are asked and
                                on the basis of the responses, the group is
                                asked to come up with a score for each
                                constraint. The facilitator also assigns a score
                                based on his assessment. This exercise is
                                conducted separately with the 3 typology groups
                                and the average for each attribute is the
                                rounded average of all 6 scores (3 typologies x
                                2 score types per attribute)
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="context-table">
                    <Form>
                        <Table striped bordered hover>
                            {this.tableHeader()}
                            <tbody>{this.allRows()}</tbody>
                        </Table>
                    </Form>
                </div>
                {this.renderRadarChart()}
            </div>
        );
    }
}
ContextScore.contextType = AppContext;

export default ContextScore;
