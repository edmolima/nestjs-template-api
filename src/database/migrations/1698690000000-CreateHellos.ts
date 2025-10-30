import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHellos1698690000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hellos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: true },
          { name: 'message', type: 'text' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hellos');
  }
}
