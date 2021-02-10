"""Add TreeStatus

Revision ID: e0a690db226b
Revises: ff4db8887989
Create Date: 2021-02-05 10:22:52.684639

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e0a690db226b'
down_revision = 'ff4db8887989'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    tree_status = postgresql.ENUM('new', 'edit', 'delete', 'import', 'frozen', name='treestatus')
    tree_status.create(op.get_bind())
    op.add_column('tree', 
    sa.Column('status', sa.Enum('new', 'edit', 'delete', 'import', 'frozen', name='treestatus'), 
        nullable=False,
        default="new",
        server_default="new"))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tree', 'status')
    tree_status = postgresql.ENUM('new', 'edit', 'delete', 'import', 'frozen', name='treestatus')
    tree_status.drop(op.get_bind())
    # ### end Alembic commands ###
