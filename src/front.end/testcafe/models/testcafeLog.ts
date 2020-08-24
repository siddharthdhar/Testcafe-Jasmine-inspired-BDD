export interface TestcafeTestLog {
    testId: string;
    tags: string;
    quarantineAttempt: string;
    fixtureName: string;
    testName: string;
    testLog: string[];
}
