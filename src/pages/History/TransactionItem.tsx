import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/helpers/formatCurrency';
import { UnifiedEntry } from './historyTypes';

interface TransactionItemProps {
  item: UnifiedEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getWalletName: (walletId: string) => string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  isExpanded,
  onToggleExpand,
  getWalletName
}) => {
  const theme = useTheme();

  // Get transaction type styling
  const getTransactionStyle = () => {
    switch (item.type) {
      case 'income':
        return {
          borderColor: theme.palette.success.main,
          bgColor: theme.palette.success.light + '20',
          iconColor: theme.palette.success.main,
          textColor: theme.palette.success.dark
        };
      case 'outcome':
        return {
          borderColor: theme.palette.error.main,
          bgColor: theme.palette.error.light + '20',
          iconColor: theme.palette.error.main,
          textColor: theme.palette.error.dark
        };
      case 'transfer':
        return {
          borderColor: theme.palette.info.main,
          bgColor: theme.palette.info.light + '20',
          iconColor: theme.palette.info.main,
          textColor: theme.palette.info.dark
        };
      default:
        return {
          borderColor: theme.palette.grey[400],
          bgColor: theme.palette.grey[100],
          iconColor: theme.palette.grey[600],
          textColor: theme.palette.grey[800]
        };
    }
  };

  const style = getTransactionStyle();

  // Get transaction icon
  const getTransactionIcon = () => {
    switch (item.type) {
      case 'income':
        return <ArrowDownCircle size={20} color={style.iconColor} />;
      case 'outcome':
        return <ArrowUpCircle size={20} color={style.iconColor} />;
      case 'transfer':
        return <Repeat2 size={20} color={style.iconColor} />;
      default:
        return null;
    }
  };

  // Get transaction title
  const getTransactionTitle = () => {
    switch (item.type) {
      case 'income':
        return `Income • ${getWalletName(item.wallet)}`;
      case 'outcome':
        return `Outcome • ${getWalletName(item.wallet)}`;
      case 'transfer':
        return `Transfer • ${getWalletName(item.from)} ➡️ ${getWalletName(item.to)}`;
      default:
        return 'Unknown Transaction';
    }
  };

  // Format time
  const formatTime = (timestamp: any) => {
    return new Date(timestamp?.seconds * 1000).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      onClick={onToggleExpand}
      sx={{
        cursor: 'pointer',
        borderLeft: 4,
        borderLeftColor: style.borderColor,
        bgcolor: style.bgColor,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          {/* Transaction Type & Wallet */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {getTransactionIcon()}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {getTransactionTitle()}
            </Typography>
          </Box>

          {/* Amount */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getTransactionIcon()}
              label={formatCurrency(item.amount, item.currency)}
              size="small"
              sx={{
                bgcolor: style.bgColor,
                color: style.textColor,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: style.iconColor
                }
              }}
            />
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Details */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {/* Description */}
            {'description' in item && item.description && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary'
                  }}
                >
                  <Edit3 size={16} />
                  <strong>Deskripsi:</strong> {item.description}
                </Typography>
              </Box>
            )}

            {/* Edit History */}
            {'editHistory' in item && item.editHistory && item.editHistory.length > 0 && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
                >
                  Histori Perubahan:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {item.editHistory.map((log, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.editedAt?.toDate?.() ?? log.editedAt).toLocaleString("id-ID")}:
                            {' '}{log.description} - {formatCurrency(log.amount, item.currency)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Notes */}
            {'notes' in item && item.notes && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  💬 <strong>Catatan:</strong> {item.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Clock size={12} color={theme.palette.text.disabled} />
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled' }}
          >
            {formatTime(item.createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionItem;