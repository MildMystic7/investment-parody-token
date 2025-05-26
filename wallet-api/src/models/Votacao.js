import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Votacao = sequelize.define('Votacao', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  opcoes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  }
});

export default Votacao;
