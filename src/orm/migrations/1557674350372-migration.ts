/* eslint-disable */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultMigration_1557674350372 implements MigrationInterface {
    public async up(_queryRunner: QueryRunner): Promise<any> {
        return Promise.all([
            // queryRunner.query(
            //     'INSERT INTO `influencer`(`id`, `email`, `name`, `passwordHash`, `appName`, `appDomain`, `isActive`, `lastActiveAt`, `createdAt`, `appPhotoId`, `profilePhotoId`) VALUES ("343fb875-daf8-4714-9223-7d218059ba5f","me@adhityan.com","Adhityan K V","$2a$10$7hjw1dkdvHImaMh9fHB7YOmMbhengp5E7C4wKeosRqcLrHlNkXS5u","Adhigram","localhost", DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)',
            // ),
        ]);
    }

    public async down(_queryRunner: QueryRunner): Promise<any> {
        return Promise.all([
            // queryRunner.query('DELETE FROM `influencer` where `id` = "343fb875-daf8-4714-9223-7d218059ba5f"'),
        ]);
    }
}
