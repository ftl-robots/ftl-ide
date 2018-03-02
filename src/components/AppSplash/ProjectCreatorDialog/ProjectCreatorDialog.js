import React, { Component } from 'react';
import { Dialog, Classes, Button, FormGroup, ControlGroup, Intent } from '@blueprintjs/core';

class ProjectCreatorDialog extends Component {
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
                                <select>
                                    <option selected>Choose a project type...</option>
                                    <option value="basic-java">Basic Java Robot Program</option>
                                </select>
                            </div>
                            <Button intent={Intent.PRIMARY} text="Create"/>
                        </ControlGroup>
                    </FormGroup>
                    
                    <h5>Or, pick an existing workspace...</h5>
                </div>
            </Dialog>
        );
    }
}

export default ProjectCreatorDialog;