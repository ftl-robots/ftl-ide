import React, { Component } from 'react';
import { Dialog, Classes, Button, FormGroup, ControlGroup, Intent } from '@blueprintjs/core';

const NULL_SELECT_VALUE = "###NULL###";

class ProjectCreatorDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newProjectType: NULL_SELECT_VALUE,
            selectedProject: NULL_SELECT_VALUE
        };

        this.handleNewProjectTypeChanged = this.handleNewProjectTypeChanged.bind(this);
        this.handleSelectedProjectChanged = this.handleSelectedProjectChanged.bind(this);
        this.handleNewProjectTypeSubmit = this.handleNewProjectTypeSubmit.bind(this);
        this.handleSelectedProjectSubmit = this.handleSelectedProjectSubmit.bind(this);
    }

    handleNewProjectTypeChanged(event) {
        this.setState({newProjectType: event.target.value});
    }

    handleSelectedProjectChanged(event) {
        this.setState({selectedProject: event.target.value});
    }

    handleNewProjectTypeSubmit(event) {
        alert("New Project: " + this.state.newProjectType);
        event.preventDefault();
    }

    handleSelectedProjectSubmit(event) {
        alert("Selected Project: " + this.state.selectedProject);
        window.location = "/workspace/" + this.state.selectedProject;
        event.preventDefault();
    }

    render() {
        return (
            <Dialog iconName="code-block" 
                    canEscapeKeyClose={false} 
                    canOutsideClickClose={false} 
                    isCloseButtonShown={false} 
                    title="Welcome!"
                    isOpen={this.props.shouldShowDialog}>
                <div className={Classes.DIALOG_BODY}>
                    <h5>Create New Project</h5>
                    <FormGroup label="Project Type:" inline={true}>
                        <ControlGroup fill={true} vertical={false}>
                            <div className="pt-select ">
                                <select value={this.state.newProjectType} onChange={this.handleNewProjectTypeChanged}>
                                    <option value={NULL_SELECT_VALUE}>Choose a project type...</option>
                                    <option value="basic-java">Basic Java Robot Program</option>
                                </select>
                            </div>
                            <Button intent={Intent.PRIMARY} text="Create"
                                    onClick={this.handleNewProjectTypeSubmit}
                                    disabled={this.state.newProjectType === NULL_SELECT_VALUE}/>
                        </ControlGroup>
                    </FormGroup>
                    
                    <h5>Or, pick an existing workspace...</h5>
                    <FormGroup label="Project Type:" inline={true}>
                        <ControlGroup fill={true} vertical={false}>
                            <div className="pt-select ">
                                <select value={this.state.selectedProject} onChange={this.handleSelectedProjectChanged}>
                                    <option value={NULL_SELECT_VALUE}>Choose an existing project...</option>
                                    <option value="test-wkspace">test-wkspace</option>
                                </select>
                            </div>
                            <Button intent={Intent.PRIMARY} text="Load"
                                    onClick={this.handleSelectedProjectSubmit}
                                    disabled={this.state.selectedProject === NULL_SELECT_VALUE}/>
                        </ControlGroup>
                    </FormGroup>
                </div>
            </Dialog>
        );
    }
}

export default ProjectCreatorDialog;