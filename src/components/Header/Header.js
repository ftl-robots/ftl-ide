import React, { Component } from 'react';
import { Button, Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core';

class Header extends Component {
    render() {
        return (
            <Navbar className="pt-dark">
                <NavbarGroup>
                    <NavbarHeading>FTL IDE</NavbarHeading>
                </NavbarGroup>
                <NavbarGroup align="right">
                    <Button className="pt-minimal" iconName="user"></Button>
                    <Button className="pt-minimal" iconName="notifications"></Button>
                    <Button className="pt-minimal" iconName="cog"></Button>
                </NavbarGroup>
            </Navbar>
        )
    }
}

export default Header;