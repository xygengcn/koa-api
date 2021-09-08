import TestTable from '@database/test';

export default class Test {
    // 随机获取一条
    static query() {
        return TestTable.get();
    }
}
