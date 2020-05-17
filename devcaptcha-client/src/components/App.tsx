import * as React from "react";
import styled from 'styled-components'

const Container = styled.div`
  background: black;
  color: white;
`;

export interface IProps {
    compiler: string;
}

export const App = (props: IProps) => (
    <Container>
        Hello World!
    </Container>
);